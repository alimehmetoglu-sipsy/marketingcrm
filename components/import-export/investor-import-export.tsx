"use client";

import { useState } from "react";
import { Download, Upload, FileText, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUploadZone } from "./file-upload-zone";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ImportError {
  row: number;
  field: string;
  message: string;
}

interface ImportResult {
  success: boolean;
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: ImportError[];
}

export function InvestorImportExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const response = await fetch("/api/investors/export");

      if (!response.ok) {
        throw new Error("Failed to export investors");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `investors_export_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success("Investors exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export investors");
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch("/api/investors/export-template");

      if (!response.ok) {
        throw new Error("Failed to download template");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "example_investor.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success("Template downloaded successfully");
    } catch (error) {
      console.error("Template download error:", error);
      toast.error("Failed to download template");
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }

    try {
      setIsImporting(true);
      setImportProgress(10);
      setImportResult(null);

      const formData = new FormData();
      formData.append("file", selectedFile);

      setImportProgress(30);

      const response = await fetch("/api/investors/import", {
        method: "POST",
        body: formData,
      });

      setImportProgress(70);

      if (!response.ok) {
        throw new Error("Failed to import investors");
      }

      const result: ImportResult = await response.json();
      setImportProgress(100);
      setImportResult(result);

      if (result.success) {
        toast.success(`Successfully imported ${result.successCount} investors`);
      } else {
        toast.warning(
          `Imported ${result.successCount} investors with ${result.errorCount} errors`
        );
      }
    } catch (error) {
      console.error("Import error:", error);
      toast.error("Failed to import investors");
    } finally {
      setIsImporting(false);
      setTimeout(() => setImportProgress(0), 1000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Export Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Download className="w-5 h-5" />
            <span>Export Investors</span>
          </CardTitle>
          <CardDescription>
            Download all investors with custom fields as CSV file
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex space-x-3">
            <Button
              onClick={handleExport}
              disabled={isExporting}
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              {isExporting ? "Exporting..." : "Export All Investors"}
            </Button>
            <Button
              onClick={handleDownloadTemplate}
              variant="outline"
              className="flex-1"
            >
              <FileText className="w-4 h-4 mr-2" />
              Download Template
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Import Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="w-5 h-5" />
            <span>Import Investors</span>
          </CardTitle>
          <CardDescription>
            Upload a CSV file to import investors. Existing investors (by email or phone) will be updated.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FileUploadZone onFileSelect={setSelectedFile} />

          {selectedFile && (
            <Button
              onClick={handleImport}
              disabled={isImporting}
              className="w-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              {isImporting ? "Importing..." : "Import Investors"}
            </Button>
          )}

          {importProgress > 0 && (
            <div className="space-y-2">
              <Progress value={importProgress} />
              <p className="text-sm text-gray-600 text-center">
                {importProgress}% complete
              </p>
            </div>
          )}

          {importResult && (
            <div className="space-y-3">
              <Alert
                className={
                  importResult.success
                    ? "bg-green-50 border-green-200"
                    : "bg-yellow-50 border-yellow-200"
                }
              >
                <div className="flex items-start space-x-3">
                  {importResult.success ? (
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <AlertDescription>
                      <p className="font-medium mb-1">
                        {importResult.success
                          ? "Import completed successfully!"
                          : "Import completed with errors"}
                      </p>
                      <div className="text-sm space-y-1">
                        <p>Total rows: {importResult.totalRows}</p>
                        <p className="text-green-600">
                          Successful: {importResult.successCount}
                        </p>
                        {importResult.errorCount > 0 && (
                          <p className="text-red-600">
                            Errors: {importResult.errorCount}
                          </p>
                        )}
                      </div>
                    </AlertDescription>
                  </div>
                </div>
              </Alert>

              {importResult.errors.length > 0 && (
                <div className="max-h-60 overflow-y-auto border rounded-lg p-3 bg-red-50">
                  <p className="text-sm font-medium text-red-900 mb-2">
                    Error Details:
                  </p>
                  <div className="space-y-2">
                    {importResult.errors.map((error, index) => (
                      <div
                        key={index}
                        className="text-xs bg-white p-2 rounded border border-red-200"
                      >
                        <p className="font-medium text-red-900">
                          Row {error.row}:
                        </p>
                        <p className="text-red-700">
                          {error.field} - {error.message}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
