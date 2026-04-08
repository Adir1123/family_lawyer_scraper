"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";
import { schedules, tasks, runs, configure } from "@trigger.dev/sdk/v3";
import { z } from "zod";
import { buildCron } from "@/lib/constants";

// -- Validation schema --------------------------------------------------------

const settingsSchema = z.object({
  group_urls: z.array(
    z.string().url("Must be a valid URL").regex(
      /facebook\.com\/groups\//,
      "Must be a Facebook group URL"
    )
  ),
  max_posts: z.coerce.number().int().min(1).max(200),
  lookback_hours: z.coerce.number().int().min(1).max(168),
  max_post_age: z.coerce.number().int().refine((v) => [24, 48, 72].includes(v), {
    message: "Max post age must be 24, 48, or 72 hours",
  }),
  schedule_frequency: z.coerce.number().int().min(1).max(24),
  schedule_from: z.coerce.number().int().min(0).max(23),
  schedule_to: z.coerce.number().int().min(0).max(23),
  active: z.coerce.boolean(),
  confidence_high: z.coerce.number().min(0.5).max(1.0),
  confidence_low: z.coerce.number().min(0.1).max(0.9),
  archive_days: z.coerce.number().int().min(7).max(365),
  trash_days: z.coerce.number().int().min(1).max(90),
});

// -- Helper: configure Trigger.dev SDK ----------------------------------------

function configureTrigger() {
  configure({
    secretKey: process.env.TRIGGER_SECRET_KEY,
  });
}

// -- Action: update scraper config --------------------------------------------

export async function updateScraperConfig(data: {
  id: string;
  group_urls: string[];
  max_posts: number;
  lookback_hours: number;
  max_post_age: number;
  schedule_frequency: number;
  schedule_from: number;
  schedule_to: number;
  active: boolean;
  trigger_schedule_id: string | null;
  confidence_high: number;
  confidence_low: number;
  archive_days: number;
  trash_days: number;
}) {
  // 1. Validate
  const parsed = settingsSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const {
    group_urls, max_posts, lookback_hours, max_post_age, schedule_frequency, schedule_from, schedule_to, active,
    confidence_high, confidence_low, archive_days, trash_days,
  } = parsed.data;

  // Cross-validate: confidence_high must be > confidence_low
  if (confidence_high <= confidence_low) {
    return { success: false, error: "High confidence threshold must be greater than low threshold" };
  }

  if (schedule_from === schedule_to) {
    return { success: false, error: "Schedule 'from' and 'to' hours cannot be the same" };
  }

  // Build cron from frequency + time window
  const cron_schedule = buildCron(schedule_frequency, schedule_from, schedule_to);

  // 2. Update Supabase
  const supabase = await createClient();
  const { error: dbError } = await supabase
    .from("scraper_config")
    .update({
      group_urls,
      max_posts,
      lookback_hours,
      max_post_age,
      cron_schedule,
      schedule_frequency,
      schedule_from,
      schedule_to,
      active,
      confidence_high,
      confidence_low,
      archive_days,
      trash_days,
      updated_at: new Date().toISOString(),
    })
    .eq("id", data.id);

  if (dbError) {
    return { success: false, error: `Database error: ${dbError.message}` };
  }

  // 3. Sync schedule to Trigger.dev
  try {
    configureTrigger();

    let scheduleId = data.trigger_schedule_id;

    if (scheduleId) {
      // Update existing imperative schedule
      await schedules.update(scheduleId, {
        task: "family-lawyer-scrape",
        cron: cron_schedule,
      });

      // Handle active toggle
      if (active) {
        await schedules.activate(scheduleId);
      } else {
        await schedules.deactivate(scheduleId);
      }
    } else {
      // Create new imperative schedule
      const created = await schedules.create({
        task: "family-lawyer-scrape",
        cron: cron_schedule,
        deduplicationKey: "family-lawyer-scrape-schedule",
      });

      scheduleId = created.id;

      // Store the schedule ID back in Supabase
      await supabase
        .from("scraper_config")
        .update({ trigger_schedule_id: scheduleId })
        .eq("id", data.id);

      // If created but should be inactive, deactivate
      if (!active) {
        await schedules.deactivate(scheduleId);
      }
    }
  } catch (triggerError) {
    const msg = triggerError instanceof Error ? triggerError.message : "Unknown error";
    return {
      success: false,
      error: `Settings saved but schedule sync failed: ${msg}`,
    };
  }

  revalidatePath("/settings");
  return { success: true, error: null };
}

// -- Action: trigger a manual run ---------------------------------------------

export async function triggerManualRun() {
  try {
    configureTrigger();
    const handle = await tasks.trigger("family-lawyer-scrape", {});
    return { success: true, runId: handle.id };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: `Failed to trigger run: ${msg}` };
  }
}

// -- Action: cancel a run -----------------------------------------------------

export async function cancelRun(runId: string) {
  try {
    configureTrigger();
    await runs.cancel(runId);
    return { success: true };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: `Failed to cancel run: ${msg}` };
  }
}
