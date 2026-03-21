"use client";

import { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Upload, FileText, X, CheckCircle2, Download, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AttendanceFile {
    file_name: string;
    file_url: string;
}

interface AttendanceSectionProps {
    bookingId: string;
    attendanceSubmitted: boolean;
    attendanceFiles: AttendanceFile[];
}

export function AttendanceSection({
    bookingId,
    attendanceSubmitted,
    attendanceFiles,
}: AttendanceSectionProps) {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);

    const handleFileSelect = useCallback((files: FileList | null) => {
        if (!files) return;
        const newFiles = Array.from(files);
        setSelectedFiles((prev) => [...prev, ...newFiles]);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragOver(false);
            handleFileSelect(e.dataTransfer.files);
        },
        [handleFileSelect]
    );

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const removeFile = useCallback((index: number) => {
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    }, []);

    const handleUpload = async () => {
        if (selectedFiles.length === 0) {
            toast.error("Please select at least one file");
            return;
        }

        setIsUploading(true);
        try {
            await api.uploadAttendanceFiles(bookingId, selectedFiles);
            toast.success("Attendance uploaded successfully!");
            setSelectedFiles([]);
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || "Failed to upload attendance");
        } finally {
            setIsUploading(false);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const baseUrl = process.env.NEXT_PUBLIC_FRAPPE_URL || "";

    // Already submitted — show file list in view-only mode
    if (attendanceSubmitted) {
        return (
            <Card className="shadow-sm border-slate-200">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-[14px] md:text-lg font-medium text-slate-800">
                        Attendance Files
                    </CardTitle>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Submitted
                    </span>
                </CardHeader>
                <CardContent className="pt-4">
                    {attendanceFiles.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {attendanceFiles.map((file, idx) => (
                                <a
                                    key={idx}
                                    href={file.file_url.startsWith("http") ? file.file_url : `${baseUrl}${file.file_url}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-white hover:border-[#7D3FD0]/30 hover:bg-[#7D3FD0]/2 transition-all"
                                >
                                    <div className="shrink-0 h-9 w-9 rounded-lg bg-[#7D3FD0]/10 flex items-center justify-center">
                                        <FileText className="h-4.5 w-4.5 text-[#7D3FD0]" />
                                    </div>
                                    <span className="text-sm font-medium text-slate-700 truncate flex-1">
                                        {file.file_name}
                                    </span>
                                    <Download className="h-4 w-4 text-slate-400 group-hover:text-[#7D3FD0] transition-colors shrink-0" />
                                </a>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-500 text-center py-4">
                            Attendance has been submitted. No file details available.
                        </p>
                    )}
                </CardContent>
            </Card>
        );
    }

    // Not submitted — show upload UI
    return (
        <Card className="shadow-sm border-slate-200">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-2 flex flex-row items-center justify-between">
                <CardTitle className="text-[14px] md:text-lg font-medium text-slate-800">
                    Upload Attendance
                </CardTitle>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Pending
                </span>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
                {/* Drop Zone */}
                <div
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={cn(
                        "relative flex flex-col items-center justify-center gap-2 py-8 px-4 rounded-xl border-2 border-dashed cursor-pointer transition-all",
                        isDragOver
                            ? "border-[#7D3FD0] bg-[#7D3FD0]/5"
                            : "border-slate-200 bg-slate-50/50 hover:border-[#7D3FD0]/40 hover:bg-[#7D3FD0]/2"
                    )}
                >
                    <div className={cn(
                        "h-12 w-12 rounded-full flex items-center justify-center transition-colors",
                        isDragOver ? "bg-[#7D3FD0]/15" : "bg-slate-100"
                    )}>
                        <Upload className={cn(
                            "h-5 w-5 transition-colors",
                            isDragOver ? "text-[#7D3FD0]" : "text-slate-400"
                        )} />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-medium text-slate-700">
                            Click to browse or drag & drop files
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                            PDF, Excel, Images — multiple files supported
                        </p>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        className="hidden"
                        onChange={(e) => handleFileSelect(e.target.files)}
                        accept=".pdf,.xlsx,.xls,.csv,.png,.jpg,.jpeg,.doc,.docx"
                    />
                </div>

                {/* Selected Files List */}
                {selectedFiles.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                            {selectedFiles.length} file{selectedFiles.length > 1 ? "s" : ""} selected
                        </p>
                        <div className="space-y-1.5">
                            {selectedFiles.map((file, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-50 border border-slate-100"
                                >
                                    <FileText className="h-4 w-4 text-[#7D3FD0] shrink-0" />
                                    <span className="text-sm text-slate-700 truncate flex-1">
                                        {file.name}
                                    </span>
                                    <span className="text-xs text-slate-400 shrink-0">
                                        {formatFileSize(file.size)}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeFile(idx);
                                        }}
                                        className="h-6 w-6 rounded-full flex items-center justify-center hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors shrink-0"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Upload Button */}
                {selectedFiles.length > 0 && (
                    <div className="flex justify-end">
                        <Button
                            onClick={handleUpload}
                            disabled={isUploading}
                            className="bg-[#7D3FD0] hover:bg-[#6B2FC0] text-white gap-2 cursor-pointer"
                        >
                            <Upload className="h-4 w-4" />
                            {isUploading ? "Uploading..." : "Upload Attendance"}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
