import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabase";

// GET - Fetch service durations
export async function GET() {
  try {
    const { data: services, error } = await supabaseAdmin
      .from("service_durations")
      .select("*")
      .order("service_name");

    if (error) {
      console.error("Error fetching service durations:", error);
      return NextResponse.json(
        { error: "Failed to fetch service durations" },
        { status: 500 }
      );
    }

    return NextResponse.json({ services });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Add new service duration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { service_name, duration_minutes, buffer_minutes } = body;

    if (!service_name || !duration_minutes) {
      return NextResponse.json(
        { error: "Service name and duration are required" },
        { status: 400 }
      );
    }

    if (duration_minutes <= 0) {
      return NextResponse.json(
        { error: "Duration must be positive" },
        { status: 400 }
      );
    }

    const { data: service, error } = await supabaseAdmin
      .from("service_durations")
      .insert({
        service_name,
        duration_minutes,
        buffer_minutes: buffer_minutes || 15
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating service duration:", error);
      return NextResponse.json(
        { error: "Failed to create service duration" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      service,
      message: "Service duration created successfully"
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update service duration
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, service_name, duration_minutes, buffer_minutes } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Service ID is required" },
        { status: 400 }
      );
    }

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (service_name) updateData.service_name = service_name;
    if (duration_minutes !== undefined) {
      if (duration_minutes <= 0) {
        return NextResponse.json(
          { error: "Duration must be positive" },
          { status: 400 }
        );
      }
      updateData.duration_minutes = duration_minutes;
    }
    if (buffer_minutes !== undefined) updateData.buffer_minutes = buffer_minutes;

    const { data: service, error } = await supabaseAdmin
      .from("service_durations")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating service duration:", error);
      return NextResponse.json(
        { error: "Failed to update service duration" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      service,
      message: "Service duration updated successfully"
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete service duration
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Service ID is required" },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("service_durations")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting service duration:", error);
      return NextResponse.json(
        { error: "Failed to delete service duration" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Service duration deleted successfully"
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
