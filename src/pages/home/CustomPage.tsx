import { Alert } from "@mui/material";
import { isAxiosError } from "axios";
import { PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";
import { CenteredSpinner } from "../../components/CenteredSpinner";
import { useIsSmallScreen } from "../../utils/useIsSmallScreen";
import { MobileMenu } from "./MobileMenu";
import { Sidebar } from "./Sidebar";
import { useConfigQuery } from "./useConfigQuery";

type CustomPageProps = PropsWithChildren<{
  currentView?: string;
}>;

function CustomPage({ children, currentView }: CustomPageProps) {
  const configQuery = useConfigQuery();
  const isSmallScreen = useIsSmallScreen();

  if (configQuery.isLoading) {
    return <CenteredSpinner />;
  }

  if (configQuery.isError) {
    if (
      isAxiosError(configQuery.error) &&
      configQuery.error.response?.status === 401
    ) {
      return <Navigate to="/login" />;
    }
    return <Alert severity="error">Une erreur est survenue</Alert>;
  }

  const title = configQuery.data?.title;
  const views = configQuery.data?.views;

  if (!title || !views) {
    return (
      <Alert severity="error">
        Une erreur est survenue (le backend à renvoyé une réponse mal formattée)
      </Alert>
    );
  }

  return (
    <div className="flex min-h-screen">
      {isSmallScreen ? (
        <MobileMenu title={title} views={views} currentView={currentView} />
      ) : (
        <Sidebar title={title} views={views} currentView={currentView} />
      )}
      {children}
    </div>
  );
}

export default CustomPage;
