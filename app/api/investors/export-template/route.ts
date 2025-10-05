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

    // Fetch all active investor fields
    const investorFields = await prisma.investor_fields.findMany({
      where: {
        is_active: true,
      },
      orderBy: {
        sort_order: "asc",
      },
      include: {
        investor_field_options: {
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
      "company",
      "position",
      "source",
      "status",
      "priority",
      "budget",
      "timeline",
      "notes",
    ];

    // Generate CSV headers
    const headers = generateHeaders(
      staticFields,
      investorFields.map((f) => ({
        name: f.name,
        label: f.label,
        type: f.type,
        is_required: f.is_required,
      }))
    );

    // Create example rows with descriptions
    const exampleRow1: any = {
      full_name: "John",
      email: "john.investor@example.com",
      phone: "+905551234567",
      company: "Tech Corp Inc.",
      position: "CEO",
      source: "referral",
      status: "active",
      priority: "high",
      budget: "$100,000",
      timeline: "Q1 2025",
      notes: "Interested in Series A funding",
    };

    const exampleRow2: any = {
      full_name: "Jane",
      email: "jane.capital@example.com",
      phone: "+905559876543",
      company: "Venture Partners",
      position: "Managing Partner",
      source: "linkedin",
      status: "qualified",
      priority: "medium",
      budget: "$250,000",
      timeline: "Q2 2025",
      notes: "Focus on SaaS investments",
    };

    // Add example values for dynamic fields
    investorFields.forEach((field) => {
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
        case "phone":
          exampleValue = "+905551234567";
          break;
        case "url":
          exampleValue = "https://example.com";
          break;
        case "number":
          exampleValue = "100000";
          break;
        case "date":
          exampleValue = "2025-01-15";
          break;
        case "select":
          if (field.investor_field_options.length > 0) {
            exampleValue = field.investor_field_options[0].value;
          } else {
            exampleValue = "Option 1";
          }
          break;
        case "multiselect":
        case "multiselect_dropdown":
          if (field.investor_field_options.length > 0) {
            exampleValue = field.investor_field_options
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
        "Content-Disposition": 'attachment; filename="example_investor.csv"',
      },
    });
  } catch (error) {
    console.error("Investor template export error:", error);
    return NextResponse.json(
      { error: "Failed to generate template" },
      { status: 500 }
    );
  }
}
