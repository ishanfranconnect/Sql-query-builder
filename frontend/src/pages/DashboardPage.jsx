import { Box, Button, Card, CardContent, Grid, Typography, Stack } from "@mui/material";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

export default function DashboardPage() {
  const user = useSelector((state) => state.auth.user);
  const isAdmin = user?.roles?.includes("ROLE_ADMIN");

  const cards = [
    {
      title: "Query Builder",
      desc: "Visually build complex SQL queries (SELECT, INSERT, UPDATE, DELETE) with our no-code builder. Advanced clauses included.",
      link: "/query-builder",
      icon: "🚀",
      iconBg: "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)",
      iconColor: "#4f46e5",
      btnText: "Build Query",
      btnBg: "#4f46e5"
    },
    {
      title: "Create Table",
      desc: "Instantly create database tables using an elegant visual form. Add custom data types, constraints, and keys with ease.",
      link: "/create-table",
      icon: "🛠️",
      iconBg: "linear-gradient(135deg, #ecfeff 0%, #cffafe 100%)",
      iconColor: "#0891b2",
      btnText: "New Table",
      btnBg: "#0891b2"
    },
    {
      title: "Saved Queries",
      desc: "Access your library of saved queries. Re-run or delete your custom SQL constructions anytime.",
      link: "/saved-queries",
      icon: "💾",
      iconBg: "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)",
      iconColor: "#16a34a",
      btnText: "View Library",
      btnBg: "#16a34a"
    },
    {
      title: "My Requests",
      desc: "Track the status of your modification requests (INSERT, UPDATE, DELETE) waiting for administrative approval.",
      link: "/my-requests",
      icon: "📑",
      iconBg: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
      iconColor: "#d97706",
      btnText: "Track Status",
      btnBg: "#d97706"
    }
  ];

  if (isAdmin) {
    cards.push({
      title: "Admin Approval",
      desc: "Review and approve/reject database modification query requests submitted by standard users in the system.",
      link: "/admin-requests",
      icon: "🛡️",
      iconBg: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
      iconColor: "#dc2626",
      btnText: "Review Queue",
      btnBg: "#dc2626"
    });
  }

  return (
    <Box sx={{ py: 4, px: { xs: 2, md: 4 }, position: "relative", overflow: "hidden", minHeight: "90vh" }}>
      {/* Floating 3D Spheres in Background (Completely Visible and Stunning) */}
      <Box sx={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden"
      }}>
        {/* Colorful 3D bouncing spheres */}
        <div className="sphere-purple" style={{ top: "15%", left: "8%" }} />
        <div className="sphere-cyan" style={{ bottom: "25%", right: "10%" }} />
        <div className="sphere-green" style={{ top: "45%", right: "6%" }} />
        <div className="sphere-amber" style={{ bottom: "12%", left: "12%" }} />

        {/* Full layout drifters that slowly cross the screen */}
        <div className="sphere-drifter-1" />
        <div className="sphere-drifter-2" />
      </Box>

      {/* Main Content (Z-Index Stacked above Background Orbs) */}
      <Box sx={{ position: "relative", zIndex: 1 }}>
        {/* Apple Style Header Section */}
        <Box sx={{ mb: 7, textAlign: "center" }}>
          <Typography 
            variant="caption" 
            fontWeight="800" 
            sx={{ 
              color: "text.secondary", 
              letterSpacing: 2, 
              textTransform: "uppercase",
              display: "inline-block",
              bgcolor: "rgba(0,0,0,0.04)",
              px: 2,
              py: 0.75,
              borderRadius: 5,
              fontSize: "0.75rem",
              mb: 2.5
            }}
          >
            Developer Studio Suite
          </Typography>
          
          <Typography 
            variant="h2" 
            fontWeight="800" 
            sx={{ 
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
              color: "#0f172a",
              letterSpacing: "-0.03em",
              mb: 2,
              fontSize: { xs: "2.5rem", md: "3.75rem" }
            }}
          >
            Smart Studio.
          </Typography>
          
          <Typography 
            variant="body1" 
            color="text.secondary" 
            sx={{ 
              fontSize: "1.15rem", 
              maxWidth: "600px", 
              mx: "auto", 
              lineHeight: 1.6,
              fontWeight: 500
            }}
          >
            Welcome back, <strong style={{ color: "#0f172a" }}>{user?.email}</strong>. Easily structure schema, preview execution logic, and run secure operations.
          </Typography>
        </Box>

        {/* Grid of Apple Cards */}
        <Grid container spacing={4} justifyContent="center">
          {cards.map((c, i) => (
            <Grid item xs={12} sm={6} md={isAdmin ? 4 : 6} lg={isAdmin ? 4 : 3} key={i}>
              <Card sx={{ 
                height: "100%", 
                display: "flex", 
                flexDirection: "column", 
                boxShadow: "0 10px 30px rgba(0,0,0,0.03)", 
                borderRadius: "28px", 
                border: "1px solid rgba(15, 23, 42, 0.07)",
                bgcolor: "rgba(255, 255, 255, 0.8)",
                backdropFilter: "blur(20px)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                position: "relative",
                overflow: "hidden",
                "&:hover": {
                  transform: "translateY(-6px)",
                  boxShadow: "0 20px 45px rgba(0,0,0,0.08)",
                  borderColor: "rgba(15, 23, 42, 0.15)"
                }
              }}>
                <CardContent sx={{ p: 4, display: "flex", flexDirection: "column", height: "100%" }}>
                  {/* Apple Squircle Icon Container */}
                  <Box sx={{ 
                    width: 56, 
                    height: 56, 
                    borderRadius: "16px", 
                    background: c.iconBg, 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    fontSize: "1.75rem",
                    mb: 3,
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.4)"
                  }}>
                    {c.icon}
                  </Box>

                  <Typography 
                    variant="h5" 
                    fontWeight="800" 
                    sx={{ 
                      color: "#0f172a", 
                      mb: 1.5,
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto',
                      letterSpacing: "-0.015em"
                    }}
                  >
                    {c.title}
                  </Typography>

                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      mb: 4, 
                      lineHeight: 1.7, 
                      fontSize: "0.925rem",
                      flexGrow: 1 
                    }}
                  >
                    {c.desc}
                  </Typography>

                  <Button 
                    component={Link} 
                    to={c.link} 
                    variant="contained"
                    fullWidth
                    sx={{ 
                      borderRadius: "14px", 
                      py: 1.5, 
                      fontWeight: "bold",
                      textTransform: "none",
                      bgcolor: "#0f172a",
                      color: "#fff",
                      boxShadow: "none",
                      transition: "all 0.2s",
                      fontSize: "0.9rem",
                      "&:hover": {
                        bgcolor: c.btnBg,
                        boxShadow: `0 4px 15px ${c.btnBg}33`
                      }
                    }}
                  >
                    {c.btnText}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}

