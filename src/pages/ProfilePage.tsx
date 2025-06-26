import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User } from "lucide-react"
import { useAppSelector } from "@/lib/hooks"

export default function ProfilePage() {
    const { user, isAuthenticated } = useAppSelector((state) => state.auth)

    if (!isAuthenticated) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Please log in to view your profile</h1>
                    <Button>Login</Button>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center space-x-2 mb-8">
                <User className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold">Profile</h1>
            </div>

            <div className="max-w-2xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>User Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Name</label>
                            <p className="text-lg">{user?.name}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Email</label>
                            <p className="text-lg">{user?.email}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Role</label>
                            <p className="text-lg capitalize">{user?.role}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
} 