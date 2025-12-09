// components/ui/LoadingSpinner.jsx
export default function LoadingSpinner({ size = 40 }) {
  return (
    <div className="flex justify-center items-center py-4">
      <div
        className="animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"
        style={{ width: size, height: size }}
      />
    </div>
  );
}
