"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function OwnerFieldDetails() {
  const params = useParams();
  const fieldId = params.id;

  const [field, setField] = useState(null);

  useEffect(() => {
    fetch(`/api/fields/details?id=${fieldId}`)
      .then((res) => res.json())
      .then((data) => setField(data.field));
  }, [fieldId]);

  if (!field) return <div className="p-6">جاري التحميل...</div>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-3xl font-bold">{field.name}</h1>

      <p>الوصف: {field.description}</p>
      <p>السعر: {field.price} جنيه</p>

      <h2 className="text-xl mt-4 font-bold">الحجوزات</h2>

      <div className="space-y-3">
        {field.bookings.map((b) => (
          <div key={b.id} className="bg-white p-3 rounded shadow">
            <p>التاريخ: {b.date}</p>
            <p>الوقت: {b.time}</p>
            <p className="font-bold">{b.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
