import { statusLabel, type RequestRecord } from "@/lib/domain/requests";
import { loc, testId } from "@/lib/test-ids";
import Link from "next/link";

function createdOn(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function RequestTable({
  caption,
  requests,
  emptyMessage,
  detailHref,
}: {
  caption: string;
  requests: RequestRecord[];
  emptyMessage: string;
  detailHref: (publicId: string) => string;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table {...loc(testId.requestTable)} className="w-full text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-slate-50 text-slate-700">
          <tr>
            <th scope="col" className="px-4 py-3 font-semibold">
              Public ID
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Title
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Status
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Created
            </th>
          </tr>
        </thead>
        <tbody>
          {requests.length === 0 ? (
            <tr>
              <td
                {...loc(testId.requestTableEmpty)}
                colSpan={4}
                className="px-4 py-6 text-slate-600"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            requests.map((request) => (
              <tr key={request.id} className="border-t border-slate-200">
                <td className="px-4 py-3 font-medium">
                  <Link
                    href={detailHref(request.publicId)}
                    className="text-nexo-accent underline"
                  >
                    {request.publicId}
                  </Link>
                </td>
                <td className="px-4 py-3">{request.title}</td>
                <td className="px-4 py-3">{statusLabel(request.status)}</td>
                <td className="px-4 py-3">{createdOn(request.createdAt)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
