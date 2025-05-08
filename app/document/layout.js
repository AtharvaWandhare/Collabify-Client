import ProtectedRoute from "@/context/ProtectedRoute";

export default function RootDocumentLayout({ children }) {
    return (
        <>
            <ProtectedRoute>
                {children}
            </ProtectedRoute>
        </>
    );
}