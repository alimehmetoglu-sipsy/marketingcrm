import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { arrayToCSV, generateHeaders } from "@/lib/csv-utils";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all active lead fields
    const leadFields = await prisma.lead_fields.findMany({
      where: {
        is_active: true,
      },
      orderBy: {
        sort_order: "asc",
      },
      include: {
        lead_field_options: {
          orderBy: {
            sort_order: "asc",
          },
        },
      },
    });

    // Define static fields
    const staticFields = [
      "full_name",
      "email",
      "phone",
      "source",
      "status",
      "priority",
      "notes_text",
    ];

    // Generate CSV headers
    const headers = generateHeaders(
      staticFields,
      leadFields.map((f) => ({
        name: f.name,
        label: f.label,
        type: f.type,
        is_required: f.is_required,
      }))
    );

    // Create example rows with descriptions
    const exampleRow1: any = {
      full_name: "John Doe",
      email: "john.doe@example.com",
      phone: "+905551234567",
      source: "website",
      status: "new",
      priority: "high",
      notes_text: "Interested in our premium package",
    };

    const exampleRow2: any = {
      full_name: "Jane Smith",
      email: "jane.smith@example.com",
      phone: "+905559876543",
      source: "referral",
      status: "contacted",
      priority: "medium",
      notes_text: "Follow up next week",
    };

    // Add example values for dynamic fields
    leadFields.forEach((field) => {
      let exampleValue = "";

      switch (field.type) {
        case "text":
          exampleValue = `Example ${field.label}`;
          break;
        case "textarea":
          exampleValue = `This is an example for ${field.label}`;
          break;
        case "email":
          exampleValue = "example@email.com";
          break;
        case "url":
          exampleValue = "https://example.com";
          break;
        case "number":
          exampleValue = "100";
          break;
        case "date":
          exampleValue = "2025-01-15";
          break;
        case "select":
          if (field.lead_field_options.length > 0) {
            exampleValue = field.lead_field_options[0].value;
          } else {
            exampleValue = "Option 1";
          }
          break;
        case "multiselect":
        case "multiselect_dropdown":
          if (field.lead_field_options.length > 0) {
            exampleValue = field.lead_field_options
              .slice(0, 2)
              .map((opt) => opt.value)
              .join("; ");
          } else {
            exampleValue = "Option 1; Option 2";
          }
          break;
        default:
          exampleValue = `Example value`;
      }

      exampleRow1[field.label] = exampleValue;
      exampleRow2[field.label] = exampleValue;
    });

    // Generate CSV with example rows
    const csvContent = arrayToCSV([exampleRow1, exampleRow2], headers);

    // Return CSV file
    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv;charset=utf-8;",
        "Content-Disposition": 'attachment; filename="example_lead.csv"',
      },
    });
  } catch (error) {
    console.error("Lead template export error:", error);
    return NextResponse.json(
      { error: "Failed to generate template" },
      { status: 500 }
    );
  }
}
