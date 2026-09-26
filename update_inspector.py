with open('src/app/inspector/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = """    // Update hotspot status
    const { error: hsError } = await supabase.from('demand_hotspots').update({
        status: 'project_proposed',
        inspector_report: reportText
    }).eq('id', selectedHotspot.id);

    if (hsError) {
        alert("Failed to submit report: " + hsError.message);
        setSubmitting(false);
        return;
    }

    // Initiative goes to Ministry to start a project
    // We will automatically create a Draft project in the 'projects' table for the Ministry
    // so they can see the initiative.
    
    const location_geom = `POINT(${exactLng} ${exactLat})`;

    const { error: pError } = await supabase.from('projects').insert({
        project_name: proposedProjectTitle,
        hml_category: selectedHotspot.infrastructure_category,
        initiative_details: `Initiative raised via Inspector Report.\\nHotspot Reason: ${selectedHotspot.request_count} citizen complaints.\\nInspector Findings: ${reportText}`,
        status: 'draft',
        state: inspector.state,
        location_geom: location_geom
    });

    setSubmitting(false);
    if (pError) {
        alert("Error creating initiative: " + pError.message);
    } else {
        alert("Report submitted and Project Initiative sent to Ministry!");
        setSelectedHotspot(null);
        setReportText("");
        setProposedProjectTitle("");
        setExactLat(null);
        setExactLng(null);
        fetchInspectorData(inspector.id);
    }"""

replacement = """    // Update hotspot status with map coordinates
    const { error: hsError } = await supabase.from('demand_hotspots').update({
        status: 'project_proposed',
        inspector_report: reportText,
        exact_lat: exactLat,
        exact_lng: exactLng
    }).eq('id', selectedHotspot.id);

    setSubmitting(false);
    if (hsError) {
        alert("Failed to submit report: " + hsError.message);
    } else {
        alert("Report submitted! Ministry will now review your field report and exact map coordinates.");
        setSelectedHotspot(null);
        setReportText("");
        setProposedProjectTitle("");
        setExactLat(null);
        setExactLng(null);
        fetchInspectorData(inspector.id);
    }"""

content = content.replace(target, replacement)
with open('src/app/inspector/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
