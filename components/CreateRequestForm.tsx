"use client";

import { loc, testId } from "@/lib/test-ids";
import { FormEvent, useState } from "react";

type CategoryOption = {
  id: string;
  name: string;
};

type FieldErrors = {
  title?: string;
  category?: string;
  description?: string;
};

export function CreateRequestForm({
  categories,
}: {
  categories: CategoryOption[];
}) {
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    if (!title.trim()) {
      next.title = "Title is required.";
    }
    if (!categoryId) {
      next.category = "Category is required.";
    }
    if (!description.trim()) {
      next.description = "Description is required.";
    }
    return next;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);

    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setPending(true);
    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          categoryId,
          description: description.trim(),
        }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: { message?: string; fields?: FieldErrors };
        } | null;
        if (body?.error?.fields) {
          setErrors(body.error.fields);
          return;
        }
        setSubmitError(body?.error?.message ?? "Could not create the request.");
        return;
      }

      window.location.assign("/customer/requests");
    } catch {
      setSubmitError("Could not create the request.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      {...loc(testId.createRequestForm)}
      onSubmit={onSubmit}
      noValidate
      className="max-w-xl"
    >
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="mb-4 flex flex-col gap-1">
          <label htmlFor={testId.fieldTitle} className="text-sm font-medium">
            Title
          </label>
          <input
            {...loc(testId.fieldTitle)}
            name="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? "field-title-error" : undefined}
            className="rounded border border-slate-300 px-3 py-2"
          />
          {errors.title ? (
            <p id="field-title-error" className="text-sm text-red-700">
              {errors.title}
            </p>
          ) : null}
        </div>
        <div className="mb-4 flex flex-col gap-1">
          <label htmlFor={testId.fieldCategory} className="text-sm font-medium">
            Category
          </label>
          <select
            {...loc(testId.fieldCategory)}
            name="category"
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            aria-invalid={Boolean(errors.category)}
            aria-describedby={
              errors.category ? "field-category-error" : undefined
            }
            className="rounded border border-slate-300 px-3 py-2"
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.category ? (
            <p id="field-category-error" className="text-sm text-red-700">
              {errors.category}
            </p>
          ) : null}
        </div>
        <div className="mb-4 flex flex-col gap-1">
          <label
            htmlFor={testId.fieldDescription}
            className="text-sm font-medium"
          >
            Description
          </label>
          <textarea
            {...loc(testId.fieldDescription)}
            name="description"
            rows={5}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            aria-invalid={Boolean(errors.description)}
            aria-describedby={
              errors.description ? "field-description-error" : undefined
            }
            className="rounded border border-slate-300 px-3 py-2"
          />
          {errors.description ? (
            <p id="field-description-error" className="text-sm text-red-700">
              {errors.description}
            </p>
          ) : null}
        </div>
        <button
          {...loc(testId.createRequestSubmit)}
          type="submit"
          disabled={pending}
          className="rounded bg-nexo-navy px-4 py-2 font-medium text-white hover:bg-slate-800 disabled:opacity-60"
        >
          Create request
        </button>
        {submitError ? (
          <p role="alert" className="mt-3 text-sm text-slate-700">
            {submitError}
          </p>
        ) : null}
      </div>
    </form>
  );
}
