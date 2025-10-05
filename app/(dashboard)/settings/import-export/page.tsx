import { Metadata } from "next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LeadImportExport } from "@/components/import-export/lead-import-export";
import { InvestorImportExport } from "@/components/import-export/investor-import-export";
import { FileUp } from "lucide-react";

export const metadata: Metadata = {
  title: "Import/Export | Marketing CRM",
  description: "Import and export leads and investors",
};

export default function ImportExportPage() {
  return (
    <div className="container mx-auto py-6 px-4 max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
            <FileUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Import/Export Data</h1>
            <p className="text-sm text-gray-600">
              Manage your leads and investors data with CSV import/export
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="leads" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="investors">Investors</TabsTrigger>
        </TabsList>

        <TabsContent value="leads" className="space-y-6">
          <LeadImportExport />
        </TabsContent>

        <TabsContent value="investors" className="space-y-6">
          <InvestorImportExport />
        </TabsContent>
      </Tabs>

      {/* Help Section */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">
          Import/Export Tips
        </h3>
        <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
          <li>Download the template file to see the correct CSV format</li>
          <li>The template includes all current custom fields dynamically</li>
          <li>For multiselect fields, separate values with semicolons (;)</li>
          <li>Existing records (by email for leads, email/phone for investors) will be updated</li>
          <li>New records will be created automatically</li>
          <li>Maximum file size: 5MB</li>
        </ul>
      </div>
    </div>
  );
}
