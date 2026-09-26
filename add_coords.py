with open('src/components/AdminHotspots.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = """                        {h.inspector_report && (
                            <div className="mt-4 pt-4 border-t border-slate-200">
                                <span className="text-xs font-bold text-emerald-600 uppercase mb-1 block flex items-center"><FileText className="w-3 h-3 mr-1"/> Inspector Report</span>
                                <p className="text-slate-600 text-sm italic">"{h.inspector_report}"</p>
                            </div>
                        )}"""

replacement = """                        {h.inspector_report && (
                            <div className="mt-4 pt-4 border-t border-slate-200">
                                <span className="text-xs font-bold text-emerald-600 uppercase mb-1 block flex items-center"><FileText className="w-3 h-3 mr-1"/> Inspector Report</span>
                                <p className="text-slate-600 text-sm italic mb-3">"{h.inspector_report}"</p>
                                {h.exact_lat && h.exact_lng && (
                                    <div className="bg-slate-100 p-2 rounded text-xs font-mono flex items-center text-slate-700">
                                        <MapPin className="w-3 h-3 mr-1 text-rose-500" />
                                        Exact Location Pinned: {Number(h.exact_lat).toFixed(6)}, {Number(h.exact_lng).toFixed(6)}
                                    </div>
                                )}
                            </div>
                        )}"""

if target in content:
    content = content.replace(target, replacement)
    with open('src/components/AdminHotspots.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
