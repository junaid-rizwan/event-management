import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield } from "lucide-react"
import { useAppSelector } from "@/lib/hooks"

export default function AdminPage() {
    const { user, isAuthenticated } = useAppSelector((state) => state.auth)

    if (!isAuthenticated) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Please log in to access admin panel</h1>
                    <Button>Login</Button>
                </div>
            </div>
        )
    }

    if (user?.role !== "admin") {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
                    <p className="text-muted-foreground">You don't have permission to access the admin panel.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center space-x-2 mb-8">
                <Shield className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold">Admin Panel</h1>
            </div>

            <div className="max-w-4xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>Admin Dashboard</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            Welcome to the admin panel. This area is reserved for administrative functions.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
} 