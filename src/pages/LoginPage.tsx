import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, Eye, EyeOff } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { loginUser, clearError } from "@/lib/slices/authSlice"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)

    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const { loading, error, isAuthenticated } = useAppSelector((state) => state.auth)

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate("/")
        }
    }, [isAuthenticated, navigate])

    // Clear error when component unmounts
    useEffect(() => {
        return () => {
            dispatch(clearError())
        }
    }, [dispatch])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!email || !password) {
            return
        }

        dispatch(loginUser({ email, password }))
    }

    return (
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-4rem)]">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="flex items-center justify-center mb-4">
                        <Calendar className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Welcome back</CardTitle>
                    <CardDescription>Sign in to your EventHub account</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowPassword(!showPassword)}
                                    disabled={loading}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                            <p>Demo accounts:</p>
                            <p>• organizer@example.com / password</p>
                            <p>• attendee@example.com / password</p>
                            <p>• admin@example.com / password</p>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Signing in..." : "Sign in"}
                        </Button>
                        <p className="text-sm text-center text-muted-foreground">
                            Don't have an account?{" "}
                            <Link to="/signup" className="text-primary hover:underline">
                                Sign up
                            </Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
} 