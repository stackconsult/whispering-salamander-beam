"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

const SourceValidator = () => {
  const [url, setUrl] = useState<string>("");
  const [query, setQuery] = useState<string>("");
  const [validationStatus, setValidationStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [validationResult, setValidationResult] = useState<string | null>(null);
  const [isValidLink, setIsValidLink] = useState<boolean | null>(null);
  const [contentMatchesQuery, setContentMatchesQuery] = useState<boolean | null>(null);

  const handleValidate = async () => {
    if (!url.trim() || !query.trim()) {
      showError("Please enter both a URL and a query.");
      return;
    }

    setValidationStatus("loading");
    setValidationResult(null);
    setIsValidLink(null);
    setContentMatchesQuery(null);
    const loadingToastId = showLoading("Validating source...");

    try {
      // Simulate API call to a backend service
      // In a real application, this would be a fetch/axios call to your backend
      const response = await new Promise<{
        success: boolean;
        message: string;
        isValidLink: boolean;
        contentMatchesQuery: boolean;
        error?: string;
      }>((resolve) => {
        setTimeout(() => {
          // Basic URL validation (can be more robust on backend)
          const urlRegex = /^(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/[a-zA-Z0-9]+\.[^\s]{2,}|[a-zA-Z0-9]+\.[^\s]{2,})$/i;
          const isUrlValid = urlRegex.test(url);

          if (!isUrlValid) {
            resolve({
              success: false,
              message: "Invalid URL format.",
              isValidLink: false,
              contentMatchesQuery: false,
              error: "Invalid URL format.",
            });
            return;
          }

          // Simulate different outcomes for demonstration
          const randomOutcome = Math.random();
          if (randomOutcome < 0.2) { // Simulate network error or invalid link
            resolve({
              success: false,
              message: "Could not reach the URL or invalid link.",
              isValidLink: false,
              contentMatchesQuery: false,
              error: "Network error or invalid link.",
            });
          } else if (randomOutcome < 0.6) { // Simulate valid link but content mismatch
            resolve({
              success: true,
              message: "Link is valid, but content does not match query.",
              isValidLink: true,
              contentMatchesQuery: false,
            });
          } else { // Simulate valid link and content match
            resolve({
              success: true,
              message: "Link is valid and content matches query!",
              isValidLink: true,
              contentMatchesQuery: true,
            });
          }
        }, 2000); // Simulate network delay
      });

      dismissToast(loadingToastId);

      if (response.success) {
        setValidationStatus("success");
        setValidationResult(response.message);
        setIsValidLink(response.isValidLink);
        setContentMatchesQuery(response.contentMatchesQuery);
        showSuccess(response.message);
      } else {
        setValidationStatus("error");
        setValidationResult(response.message);
        setIsValidLink(response.isValidLink);
        setContentMatchesQuery(response.contentMatchesQuery);
        showError(response.message);
      }
    } catch (error) {
      dismissToast(loadingToastId);
      setValidationStatus("error");
      setValidationResult("An unexpected error occurred during validation.");
      setIsValidLink(false);
      setContentMatchesQuery(false);
      showError("An unexpected error occurred.");
      console.error("Validation error:", error);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Source Content Validator</CardTitle>
        <CardDescription>
          Enter a URL and a query to validate if the source content matches.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="url">Source URL</Label>
          <Input
            id="url"
            type="url"
            placeholder="https://example.com/article"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={validationStatus === "loading"}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="query">Query</Label>
          <Input
            id="query"
            type="text"
            placeholder="Key information to match"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={validationStatus === "loading"}
          />
        </div>
        <Button
          onClick={handleValidate}
          className="w-full"
          disabled={validationStatus === "loading"}
        >
          {validationStatus === "loading" && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Validate Source
        </Button>

        {validationResult && (
          <div className="mt-4 p-4 border rounded-md bg-muted/50">
            <p className="font-medium mb-2">Validation Result:</p>
            <div className="flex items-center space-x-2">
              {isValidLink ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span>Link Valid: {isValidLink ? "Yes" : "No"}</span>
            </div>
            <div className="flex items-center space-x-2 mt-1">
              {contentMatchesQuery ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span>Content Matches Query: {contentMatchesQuery ? "Yes" : "No"}</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{validationResult}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SourceValidator;