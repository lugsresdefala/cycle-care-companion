import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
// @ts-ignore
import { SignIn, SignUp, useUser } from "@clerk/clerk-react";
import logo from "@/assets/logo-sm.webp";

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // @ts-ignore
  const { isLoaded, isSignedIn } = useUser();
  const isSignUp = location.pathname.includes("sign-up");

  useEffect(() => {
    if (isLoaded && isSignedIn) navigate("/", { replace: true });
  }, [isLoaded, isSignedIn, navigate]);

  const base = import.meta.env.BASE_URL.replace(/\/$/, "") || "";
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
      <div
        className="hero-gradient-orb w-[600px] h-[600px] -top-[200px] -left-[200px] fixed"
        style={{ background: "radial-gradient(circle, hsla(218,72%,32%,0.13) 0%, transparent 65%)" }}
      />
      <div
        className="hero-gradient-orb w-[400px] h-[400px] bottom-[10%] right-[5%] fixed"
        style={{ background: "radial-gradient(circle, hsla(25,88%,56%,0.08) 0%, transparent 65%)" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm space-y-6"
      >
        <div className="text-center space-y-3">
          <img src={logo} alt="IDALIA" className="w-16 h-16 mx-auto rounded-full object-cover shadow-logo" />
          <h1 className="font-display text-2xl font-semibold text-foreground">
            {isSignUp ? "Criar conta" : "Entrar"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isSignUp ? "Comece com 3 calculos gratuitos" : "Acesse suas calculadoras e pacientes"}
          </p>
        </div>

        <div className="flex justify-center">
          {isSignUp ? (
            <SignUp
              routing="path"
              path={`${base}/sign-up`}
              signInUrl={`${base}/sign-in`}
              afterSignUpUrl={`${base}/`}
            />
          ) : (
            <SignIn
              routing="path"
              path={`${base}/sign-in`}
              signUpUrl={`${base}/sign-up`}
              afterSignInUrl={`${base}/`}
            />
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
