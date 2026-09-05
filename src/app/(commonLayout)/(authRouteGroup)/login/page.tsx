import LoginFrom from '@/components/modules/auth/LoginFrom'

interface LoginParams {
    searchParams: Promise<{ redirect?: string }>
}

const LoginPage = async ({ searchParams }: LoginParams) => {
    const params = await searchParams;
    const redirectPath = params.redirect
    return (
        <div className="w-full h-screen">
            <LoginFrom redirectPath={redirectPath} />
        </div>
    )
}

export default LoginPage