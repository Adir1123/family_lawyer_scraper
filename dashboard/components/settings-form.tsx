"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { timeAgo } from "@/lib/utils";
import { updateScraperConfig, triggerManualRun, cancelRun } from "@/lib/actions/settings";
import { SCHEDULE_PRESETS, HOUR_OPTIONS } from "@/lib/constants";
import type { ScraperConfig, RunMetrics } from "@/lib/types";

interface SettingsFormProps {
  config: ScraperConfig;
  lastRun: RunMetrics | null;
}

const FB_GROUP_REGEX = /facebook\.com\/groups\//;

export function SettingsForm({ config, lastRun }: SettingsFormProps) {
  // Form state
  const [groupUrls, setGroupUrls] = useState<string[]>(config.group_urls ?? []);
  const [newGroupUrl, setNewGroupUrl] = useState("");
  const [maxPosts, setMaxPosts] = useState(config.max_posts ?? 50);
  const [lookbackHours, setLookbackHours] = useState(config.lookback_hours ?? 24);
  const [maxPostAge, setMaxPostAge] = useState(config.max_post_age ?? 48);
  const [scheduleFrequency, setScheduleFrequency] = useState(config.schedule_frequency ?? 4);
  const [scheduleFrom, setScheduleFrom] = useState(config.schedule_from ?? 0);
  const [scheduleTo, setScheduleTo] = useState(config.schedule_to ?? 23);
  const [active, setActive] = useState(config.active ?? true);
  const [confidenceHigh, setConfidenceHigh] = useState(config.confidence_high ?? 0.75);
  const [confidenceLow, setConfidenceLow] = useState(config.confidence_low ?? 0.4);
  const [archiveDays, setArchiveDays] = useState(config.archive_days ?? 90);
  const [trashDays, setTrashDays] = useState(config.trash_days ?? 30);

  // UI state
  const [isSaving, startSaveTransition] = useTransition();
  const [isRunning, startRunTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingUrl, setEditingUrl] = useState("");
  const [currentRunId, setCurrentRunId] = useState<string | null>(null);
  const [isCancelling, startCancelTransition] = useTransition();

  function handleAddGroup() {
    const url = newGroupUrl.trim();
    if (!url) return;

    if (!FB_GROUP_REGEX.test(url)) {
      setUrlError("Must be a Facebook group URL (e.g., https://www.facebook.com/groups/...)");
      return;
    }

    if (groupUrls.includes(url)) {
      setUrlError("This group is already added");
      return;
    }

    setGroupUrls([...groupUrls, url]);
    setNewGroupUrl("");
    setUrlError(null);
  }

  function handleRemoveGroup(index: number) {
    setGroupUrls(groupUrls.filter((_, i) => i !== index));
  }

  function handleStartEdit(index: number) {
    setEditingIndex(index);
    setEditingUrl(groupUrls[index]);
    setUrlError(null);
  }

  function handleSaveEdit() {
    if (editingIndex === null) return;
    const url = editingUrl.trim();
    if (!url) return;

    if (!FB_GROUP_REGEX.test(url)) {
      setUrlError("Must be a Facebook group URL");
      return;
    }

    if (groupUrls.some((u, i) => u === url && i !== editingIndex)) {
      setUrlError("This group is already added");
      return;
    }

    const updated = [...groupUrls];
    updated[editingIndex] = url;
    setGroupUrls(updated);
    setEditingIndex(null);
    setEditingUrl("");
    setUrlError(null);
  }

  function handleCancelEdit() {
    setEditingIndex(null);
    setEditingUrl("");
    setUrlError(null);
  }

  function handleSave() {
    setMessage(null);
    startSaveTransition(async () => {
      const result = await updateScraperConfig({
        id: config.id,
        group_urls: groupUrls,
        max_posts: maxPosts,
        lookback_hours: lookbackHours,
        max_post_age: maxPostAge,
        schedule_frequency: scheduleFrequency,
        schedule_from: scheduleFrom,
        schedule_to: scheduleTo,
        active,
        trigger_schedule_id: config.trigger_schedule_id,
        confidence_high: confidenceHigh,
        confidence_low: confidenceLow,
        archive_days: archiveDays,
        trash_days: trashDays,
      });

      if (result.success) {
        setMessage({ type: "success", text: "Settings saved successfully" });
      } else {
        setMessage({ type: "error", text: result.error || "Failed to save" });
      }
    });
  }

  function handleRunNow() {
    setMessage(null);
    startRunTransition(async () => {
      const result = await triggerManualRun();
      if (result.success) {
        setCurrentRunId(result.runId ?? null);
        setMessage({ type: "success", text: "Scrape run triggered successfully" });
      } else {
        setMessage({ type: "error", text: result.error || "Failed to trigger run" });
      }
    });
  }

  function handleCancelRun() {
    if (!currentRunId) return;
    setMessage(null);
    startCancelTransition(async () => {
      const result = await cancelRun(currentRunId!);
      if (result.success) {
        setCurrentRunId(null);
        setMessage({ type: "success", text: "Run cancelled" });
      } else {
        setMessage({ type: "error", text: result.error || "Failed to cancel run" });
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Section A: Status & Last Run */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Scraper Status</CardTitle>
            <div className="flex flex-col items-end gap-1">
              {active && (
                <span className="text-xs text-emerald-600 font-medium">now active</span>
              )}
              <Select
                value={active ? "active" : "inactive"}
                onChange={(e) => setActive(e.target.value === "active")}
                className="w-[140px]"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Last run: <span className="font-medium text-foreground">{lastRun ? timeAgo(lastRun.completed_at) : "Never"}</span>
              </p>
              {lastRun && (
                <p className="text-xs text-muted-foreground">
                  {lastRun.posts_scraped} posts scanned &middot; {lastRun.leads_found} leads found &middot; {lastRun.tokens_used} tokens used
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRunNow}
                disabled={isRunning}
              >
                {isRunning ? "Triggering..." : "Run Now"}
              </Button>
              {currentRunId && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleCancelRun}
                  disabled={isCancelling}
                >
                  {isCancelling ? "Cancelling..." : "Cancel Run"}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section B: Facebook Groups */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Facebook Groups</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {groupUrls.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No groups configured. Add a Facebook group URL to start scraping.
            </p>
          ) : (
            <div className="space-y-2">
              {groupUrls.map((url, index) => (
                <div key={index} className="flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-2">
                  {editingIndex === index ? (
                    <>
                      <Input
                        value={editingUrl}
                        onChange={(e) => setEditingUrl(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") { e.preventDefault(); handleSaveEdit(); }
                          if (e.key === "Escape") handleCancelEdit();
                        }}
                        className="flex-1 h-8 text-sm"
                        dir="ltr"
                        autoFocus
                      />
                      <Button variant="outline" size="sm" onClick={handleSaveEdit} className="h-8 px-2 text-xs">
                        Save
                      </Button>
                      <Button variant="ghost" size="sm" onClick={handleCancelEdit} className="h-8 px-2 text-xs">
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <p className="text-sm flex-1 truncate" dir="ltr">{url}</p>
                      <button
                        type="button"
                        onClick={() => handleStartEdit(index)}
                        className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                        aria-label="Edit group"
                      >
                        &#9998;
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveGroup(index)}
                        className="text-muted-foreground hover:text-destructive transition-colors text-lg leading-none"
                        aria-label="Remove group"
                      >
                        &times;
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Input
              value={newGroupUrl}
              onChange={(e) => {
                setNewGroupUrl(e.target.value);
                setUrlError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddGroup();
                }
              }}
              placeholder="https://www.facebook.com/groups/..."
              className="flex-1"
            />
            <Button variant="outline" onClick={handleAddGroup}>
              Add
            </Button>
          </div>
          {urlError && (
            <p className="text-xs text-destructive">{urlError}</p>
          )}
        </CardContent>
      </Card>

      {/* Section C: Scraper Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Scraper Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="max_posts">Max Posts per Group</Label>
            <Input
              id="max_posts"
              type="number"
              min={1}
              max={200}
              value={maxPosts}
              onChange={(e) => setMaxPosts(Number(e.target.value))}
              className="w-full md:max-w-[200px]"
            />
            <p className="text-xs text-muted-foreground">
              Maximum posts to scrape from each group per run (1–200)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lookback_hours">Lookback Hours</Label>
            <Input
              id="lookback_hours"
              type="number"
              min={1}
              max={168}
              value={lookbackHours}
              onChange={(e) => setLookbackHours(Number(e.target.value))}
              className="w-full md:max-w-[200px]"
            />
            <p className="text-xs text-muted-foreground">
              Only scrape posts from the last N hours (1–168, i.e. up to 1 week)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="max_post_age">Max Post Age</Label>
            <Select
              id="max_post_age"
              value={String(maxPostAge)}
              onChange={(e) => setMaxPostAge(Number(e.target.value))}
              className="w-full md:max-w-[200px]"
            >
              <option value="24">24 hours</option>
              <option value="48">48 hours</option>
              <option value="72">72 hours</option>
            </Select>
            <p className="text-xs text-muted-foreground">
              Reject posts created more than this many hours ago. Old posts that resurface due to new comments will be filtered out.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Section D: Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Schedule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="schedule_frequency">Run Frequency</Label>
            <Select
              id="schedule_frequency"
              value={String(scheduleFrequency)}
              onChange={(e) => setScheduleFrequency(Number(e.target.value))}
              className="max-w-[280px]"
            >
              {SCHEDULE_PRESETS.map((preset) => (
                <option key={preset.value} value={preset.value}>
                  {preset.label}
                </option>
              ))}
            </Select>
            <p className="text-xs text-muted-foreground">
              How often the scraper runs automatically
            </p>
          </div>

          <div className="space-y-2">
            <Label>Active Hours</Label>
            <div className="flex flex-wrap items-center gap-2 md:gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">From</span>
                <Select
                  value={String(scheduleFrom)}
                  onChange={(e) => setScheduleFrom(Number(e.target.value))}
                  className="w-[100px] md:w-[110px]"
                >
                  {HOUR_OPTIONS.map((h) => (
                    <option key={h.value} value={h.value}>{h.label}</option>
                  ))}
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">To</span>
                <Select
                  value={String(scheduleTo)}
                  onChange={(e) => setScheduleTo(Number(e.target.value))}
                  className="w-[100px] md:w-[110px]"
                >
                  {HOUR_OPTIONS.map((h) => (
                    <option key={h.value} value={h.value}>{h.label}</option>
                  ))}
                </Select>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Only run the scraper between these hours (e.g., 06:00 to 22:00)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Section E: AI Confidence Thresholds */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">AI Confidence Thresholds</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="confidence_high">High Confidence Threshold</Label>
            <Input
              id="confidence_high"
              type="number"
              min={0.5}
              max={1.0}
              step={0.05}
              value={confidenceHigh}
              onChange={(e) => setConfidenceHigh(Number(e.target.value))}
              className="w-full md:max-w-[200px]"
            />
            <p className="text-xs text-muted-foreground">
              Posts above this score are auto-classified as &quot;high&quot; leads (0.50–1.00)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confidence_low">Low Confidence Threshold</Label>
            <Input
              id="confidence_low"
              type="number"
              min={0.1}
              max={0.9}
              step={0.05}
              value={confidenceLow}
              onChange={(e) => setConfidenceLow(Number(e.target.value))}
              className="w-full md:max-w-[200px]"
            />
            <p className="text-xs text-muted-foreground">
              Posts between this and high threshold are &quot;medium&quot; leads. Below this = trash (0.10–0.90)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Section F: Data Retention */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Data Retention</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="archive_days">Archive Handled Leads After (days)</Label>
            <Input
              id="archive_days"
              type="number"
              min={7}
              max={365}
              value={archiveDays}
              onChange={(e) => setArchiveDays(Number(e.target.value))}
              className="w-full md:max-w-[200px]"
            />
            <p className="text-xs text-muted-foreground">
              Leads marked as &quot;handled&quot; will be auto-archived after this many days (7–365)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="trash_days">Delete Trash After (days)</Label>
            <Input
              id="trash_days"
              type="number"
              min={1}
              max={90}
              value={trashDays}
              onChange={(e) => setTrashDays(Number(e.target.value))}
              className="w-full md:max-w-[200px]"
            />
            <p className="text-xs text-muted-foreground">
              Rejected posts (trash) will be permanently deleted after this many days (1–90)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save button + feedback */}
      <div className="space-y-3">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full"
          size="lg"
        >
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>

        {message && (
          <div
            className={`text-sm text-center py-2 px-4 rounded-lg ${
              message.type === "success"
                ? "bg-emerald-500/10 text-emerald-600"
                : "bg-destructive/10 text-destructive"
            }`}
          >
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
}
