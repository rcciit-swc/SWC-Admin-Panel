import { Skeleton } from '@/components/ui/skeleton';

const COLUMN_WIDTHS = [
  80, 150, 180, 200, 180, 200, 200, 200, 300, 200, 280, 240,
];
const TABLE_WIDTH = COLUMN_WIDTHS.reduce((a, b) => a + b, 0);

export default function TableSkeleton() {
  return (
    <div className="overflow-x-auto border border-gray-800 rounded-lg bg-[#0B0F17]">
      <div style={{ width: TABLE_WIDTH }}>
        <div className="sticky top-0 z-10 flex items-center font-bold border-b border-gray-800 bg-[#0B0F17]">
          {COLUMN_WIDTHS.map((width, index) => (
            <div key={index} className="p-4 flex-none" style={{ width }}>
              <Skeleton className="h-4 w-full bg-gray-700" />
            </div>
          ))}
        </div>
        <div className="overflow-hidden" style={{ height: 600 }}>
          {Array.from({ length: 10 }).map((_, rowIndex) => (
            <div
              key={rowIndex}
              className="flex items-center border-b border-gray-800"
            >
              {COLUMN_WIDTHS.map((width, colIndex) => (
                <div key={colIndex} className="p-4 flex-none" style={{ width }}>
                  <Skeleton className="h-4 w-full bg-gray-700" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
