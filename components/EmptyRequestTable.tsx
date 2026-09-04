import { loc, testId } from "@/lib/test-ids";

export function EmptyRequestTable({ caption }: { caption: string }) {
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
          <tr>
            <td
              {...loc(testId.requestTableEmpty)}
              colSpan={4}
              className="px-4 py-6 text-slate-600"
            >
              No requests yet. Seed data arrives in Iteration 5.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
