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
  showCustomer = false,
}: {
  caption: string;
  requests: RequestRecord[];
  emptyMessage: string;
  detailHref: (publicId: string) => string;
  showCustomer?: boolean;
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
            {showCustomer ? (
              <th scope="col" className="px-4 py-3 font-semibold">
                Customer
              </th>
            ) : null}
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
                colSpan={showCustomer ? 5 : 4}
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
                {showCustomer ? (
                  <td className="px-4 py-3">{request.customer.name}</td>
                ) : null}
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
