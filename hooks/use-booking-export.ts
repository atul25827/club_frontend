import { useState } from 'react';
import { exportToExcel } from '@/lib/excel-export';
import { toast } from 'sonner';

export function useBookingExport<T>(
    fetchPageFn: (page: number, limit: number, filters: any) => Promise<{ data: T[], total_count: number }>,
    formatFn: (item: T) => any,
    baseFilename: string
) {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async (filters: any) => {
        setIsExporting(true);
        // toast.info("Starting export...");
        try {
            let allData: T[] = [];
            let page = 1;
            const limit = 1000; // Fetch in chunks
            let total = 0;

            // Initial fetch
            const firstResponse = await fetchPageFn(page, limit, filters);
            if (!firstResponse || !firstResponse.data) {
                throw new Error("Invalid API response");
            }
            allData = [...firstResponse.data];
            total = firstResponse.total_count;

            // Fetch remaining pages if any
            const totalPages = Math.ceil(total / limit);

            // Loop for remaining pages (Sequential to avoid hammering server)
            for (let p = 2; p <= totalPages; p++) {
                const res = await fetchPageFn(p, limit, filters);
                if (res && res.data) {
                    allData = [...allData, ...res.data];
                }
            }

            if (allData.length === 0) {
                toast.warning("No data to export with current filters");
                return;
            }

            const formattedData = allData.map(formatFn);

            const dateStr = new Date().toISOString().split('T')[0];
            const filename = `${baseFilename}_${dateStr}`;

            exportToExcel(formattedData, filename);
            toast.success(`Exported ${allData.length} records successfully`);
        } catch (error) {
            console.error("Export failed", error);
            toast.error("Failed to export data");
        } finally {
            setIsExporting(false);
        }
    };

    return { handleExport, isExporting };
}
