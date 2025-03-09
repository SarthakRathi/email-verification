// EnhancedDashboard.jsx
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  Box,
  Grid,
  CardContent,
  Typography,
  Button,
  Stack,
  Modal,
  Fade,
  LinearProgress,
  Container,
  Avatar,
  useTheme,
  alpha,
  Chip,
  Tooltip,
  IconButton,
  Card as MuiCard,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  Divider,
} from "@mui/material";
import {
  CheckCircle,
  Warning,
  Error,
  Email,
  History,
  Search,
  ArrowForward,
  FilterList,
  Assessment,
  DonutLarge,
  MoreVert,
} from "@mui/icons-material";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip as ChartTooltip,
  Legend,
  BarElement,
  ArcElement,
  Filler,
} from "chart.js";
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ChartTooltip,
  Legend,
  BarElement,
  ArcElement,
  Filler
);

// Fallback trend labels
const fallbackTrendLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// StyledCard: Filter out custom prop 'hoverEffect'
const StyledCard = styled(MuiCard, {
  shouldForwardProp: (prop) => prop !== "hoverEffect",
})(({ theme, bgcolor, hoverEffect = true }) => ({
  borderRadius: theme.shape.borderRadius * 1.5,
  transition: "all 0.3s ease",
  boxShadow: `0 6px 15px ${alpha(
    theme.palette.common.black,
    0.05
  )}, 0 1px 1px ${alpha(theme.palette.common.black, 0.03)}`,
  backgroundColor: bgcolor
    ? `${alpha(bgcolor, 0.12)}`
    : theme.palette.background.paper,
  border: `1px solid ${alpha(bgcolor || theme.palette.divider, 0.08)}`,
  height: "100%",
  position: "relative",
  overflow: "hidden",
  ...(hoverEffect && {
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: `0 10px 30px ${alpha(
        theme.palette.common.black,
        0.1
      )}, 0 1px 1px ${alpha(theme.palette.common.black, 0.05)}`,
    },
  }),
}));

const GradientHeader = styled(Box)(({ theme }) => ({
  background: `linear-gradient(120deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
  color: "white",
  padding: theme.spacing(3),
  paddingBottom: theme.spacing(7),
  marginBottom: theme.spacing(-5),
  borderRadius: theme.shape.borderRadius * 1.5,
  position: "relative",
  overflow: "hidden",
  "&::after": {
    content: '""',
    position: "absolute",
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: "50%",
    background: alpha("#fff", 0.1),
    pointerEvents: "none",
  },
}));

// Donut Chart Component for Verification Results
const VerificationDonutChart = ({ kpiData }) => {
  const theme = useTheme();
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !kpiData || kpiData.totalEmails === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const size = 160;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = centerX - 20;
    const validRatio = kpiData.valid / kpiData.totalEmails;
    const riskyRatio = kpiData.risky / kpiData.totalEmails;
    const validAngle = validRatio * 2 * Math.PI;
    const riskyAngle = riskyRatio * 2 * Math.PI;

    ctx.clearRect(0, 0, size, size);
    ctx.shadowColor = "rgba(0, 0, 0, 0.1)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2;

    // Valid segment
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + validAngle);
    ctx.fillStyle = theme.palette.success.main;
    ctx.fill();

    // Risky segment
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(
      centerX,
      centerY,
      radius,
      -Math.PI / 2 + validAngle,
      -Math.PI / 2 + validAngle + riskyAngle
    );
    ctx.fillStyle = theme.palette.warning.main;
    ctx.fill();

    // Invalid segment
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(
      centerX,
      centerY,
      radius,
      -Math.PI / 2 + validAngle + riskyAngle,
      -Math.PI / 2 + 2 * Math.PI
    );
    ctx.fillStyle = theme.palette.error.main;
    ctx.fill();

    // Remove shadow for inner circle
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Inner white circle (donut effect)
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.65, 0, 2 * Math.PI);
    ctx.fillStyle = theme.palette.background.paper;
    ctx.fill();

    // Inner border
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.65, 0, 2 * Math.PI);
    ctx.strokeStyle = alpha(theme.palette.divider, 0.5);
    ctx.lineWidth = 1;
    ctx.stroke();

    // Center text (valid %)
    ctx.font = `bold ${20 * dpr}px ${theme.typography.fontFamily}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = theme.palette.text.primary;
    ctx.fillText(`${Math.round(validRatio * 100)}%`, centerX, centerY - 8);

    ctx.font = `${14 * dpr}px ${theme.typography.fontFamily}`;
    ctx.fillStyle = theme.palette.success.main;
    ctx.fillText("Success", centerX, centerY + 12);
  }, [kpiData, theme]);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        py: 2,
      }}
    >
      <canvas ref={canvasRef} />
    </Box>
  );
};

const Dashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  // Get the userId from localStorage
  const userId = localStorage.getItem("userId");

  // Use fallback trend labels
  const trendLabels = fallbackTrendLabels;

  // KPI data from backend (showing total emails for the user)
  const [kpiData, setKpiData] = useState({
    totalEmails: 0,
    valid: 0,
    risky: 0,
    invalid: 0,
  });

  // Trends data from backend
  const [trendsData, setTrendsData] = useState({
    labels: trendLabels,
    datasets: [
      {
        label: "Emails",
        data: [0, 0, 0, 0, 0, 0, 0],
        borderColor: theme.palette.primary.main,
        backgroundColor: alpha(theme.palette.primary.main, 0.1),
        tension: 0.3,
        fill: true,
        pointBackgroundColor: theme.palette.primary.main,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  });
  const [trendFilter, setTrendFilter] = useState("7d");

  // Batches from backend (filtered by user_id)
  const [recentBatches, setRecentBatches] = useState([]);
  // Modal for drill-down
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);

  // Username from backend
  const [userName, setUserName] = useState("");

  // Fetch user details (including fullName) using token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios
        .get("http://localhost:3001/api/user", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setUserName(response.data.fullName);
        })
        .catch((err) => {
          console.error("Error fetching user:", err);
          setUserName("User");
        });
    }
  }, []);

  // Fetch verification batches for this user and compute summary
  useEffect(() => {
    axios
      .get(`http://localhost:3001/api/verification-batch?user_id=${userId}`)
      .then((response) => {
        const batches = response.data;
        batches.forEach((batch) => {
          const emails = batch.emails || [];
          batch.total = emails.length;
          batch.valid = emails.filter((e) => e.status === "valid").length;
          batch.risky = emails.filter((e) => e.status === "risky").length;
          batch.invalid = emails.filter((e) => e.status === "invalid").length;
        });
        setRecentBatches(batches);
        const summary = batches.reduce(
          (acc, b) => {
            acc.totalEmails += b.total;
            acc.valid += b.valid;
            acc.risky += b.risky;
            acc.invalid += b.invalid;
            return acc;
          },
          { totalEmails: 0, valid: 0, risky: 0, invalid: 0 }
        );
        setKpiData(summary);
      })
      .catch((err) => {
        console.error("Error fetching verification batches:", err);
      });
  }, [userId]);

  // Fetch trends data from backend for this user
  useEffect(() => {
    axios
      .get(
        `http://localhost:3001/api/verification-trends?range=${trendFilter}&user_id=${userId}`
      )
      .then((response) => {
        const { labels, data } = response.data;
        // Format labels to show just month & day
        const formattedLabels = labels.map((label) =>
          new Date(label).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })
        );
        setTrendsData({
          labels: formattedLabels,
          datasets: [
            {
              label: "Emails",
              data,
              borderColor: theme.palette.primary.main,
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              tension: 0.3,
              fill: true,
              pointBackgroundColor: theme.palette.primary.main,
              pointRadius: 4,
              pointHoverRadius: 6,
            },
          ],
        });
      })
      .catch((err) => {
        console.error("Error fetching trends data:", err);
        setTrendsData({
          labels: trendLabels,
          datasets: [
            {
              label: "Emails",
              data: [300, 350, 400, 370, 420, 380, 410],
              borderColor: theme.palette.primary.main,
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              tension: 0.3,
              fill: true,
              pointBackgroundColor: theme.palette.primary.main,
              pointRadius: 4,
              pointHoverRadius: 6,
            },
          ],
        });
      });
  }, [trendFilter, theme, trendLabels, userId]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: alpha(theme.palette.common.black, 0.8),
        titleFont: { size: 13, family: theme.typography.fontFamily },
        bodyFont: { size: 12, family: theme.typography.fontFamily },
        padding: 10,
        cornerRadius: 4,
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 10 } } },
      y: {
        beginAtZero: true,
        grid: { color: alpha(theme.palette.divider, 0.1) },
        ticks: { font: { size: 10 } },
      },
    },
  };

  const handleBatchDetails = (batch) => {
    setSelectedBatch(batch);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedBatch(null);
  };

  const downloadCSV = (filename, emails) => {
    const header = "email,status,verified_at\n";
    const rows = emails
      .map((e) => `${e.email},${e.status},${e.verified_at || ""}`)
      .join("\n");
    const csvContent = header + rows;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadReport = () => {
    if (!selectedBatch || !selectedBatch.emails) return;
    const validEmails = selectedBatch.emails.filter(
      (e) => e.status === "valid"
    );
    const riskyEmails = selectedBatch.emails.filter(
      (e) => e.status === "risky"
    );
    const invalidEmails = selectedBatch.emails.filter(
      (e) => e.status === "invalid"
    );

    downloadCSV(`batch_${selectedBatch.id}_valid.csv`, validEmails);
    downloadCSV(`batch_${selectedBatch.id}_risky.csv`, riskyEmails);
    downloadCSV(`batch_${selectedBatch.id}_invalid.csv`, invalidEmails);
  };

  return (
    <Container maxWidth={false} sx={{ py: 4 }}>
      {/* Header */}
      <GradientHeader>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography
              variant="h4"
              component="h1"
              fontWeight="bold"
              gutterBottom
            >
              Hello, {userName}! Welcome back.
            </Typography>
            <Typography variant="subtitle1">
              Your email verification dashboard
            </Typography>
          </Box>
        </Box>
        {/* Quick Actions with Navigation */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ mt: 3 }}
        >
          <Button
            variant="contained"
            startIcon={<Search />}
            onClick={() => navigate("/dashboard/single")}
            sx={{
              bgcolor: alpha("#fff", 0.15),
              "&:hover": { bgcolor: alpha("#fff", 0.25) },
              borderRadius: 6,
              textTransform: "none",
              fontWeight: 500,
              px: 3,
            }}
          >
            Verify Email
          </Button>
          <Button
            variant="contained"
            startIcon={<Email />}
            onClick={() => navigate("/dashboard/bulk")}
            sx={{
              bgcolor: alpha("#fff", 0.15),
              "&:hover": { bgcolor: alpha("#fff", 0.25) },
              borderRadius: 6,
              textTransform: "none",
              fontWeight: 500,
              px: 3,
            }}
          >
            Bulk Verify
          </Button>
          <Button
            variant="contained"
            startIcon={<History />}
            onClick={() => navigate("/dashboard/history")}
            sx={{
              bgcolor: alpha("#fff", 0.15),
              "&:hover": { bgcolor: alpha("#fff", 0.25) },
              borderRadius: 6,
              textTransform: "none",
              fontWeight: 500,
              px: 3,
            }}
          >
            View History
          </Button>
        </Stack>
      </GradientHeader>

      {/* Summary Cards Row */}
      <Grid container spacing={3} sx={{ mt: -1 }}>
        <Grid item xs={12}>
          <Card
            elevation={3}
            sx={{
              borderRadius: 2,
              mb: 3,
              boxShadow: `0 8px 25px ${alpha(
                theme.palette.common.black,
                0.05
              )}`,
            }}
          >
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Grid container spacing={3}>
                {/* Total Emails */}
                <Grid item xs={12} sm={6} md={3}>
                  <Box>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Avatar
                        sx={{
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main,
                          width: 38,
                          height: 38,
                          mr: 1.5,
                        }}
                      >
                        <Assessment fontSize="small" />
                      </Avatar>
                      <Typography variant="subtitle2" color="text.secondary">
                        Total Emails
                      </Typography>
                    </Box>
                    <Typography
                      variant="h4"
                      sx={{ fontWeight: "bold", ml: 6.5 }}
                    >
                      {kpiData.totalEmails.toLocaleString()}
                    </Typography>
                  </Box>
                </Grid>
                {/* Success Rate */}
                <Grid item xs={12} sm={6} md={3}>
                  <Box>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Avatar
                        sx={{
                          bgcolor: alpha(theme.palette.success.main, 0.1),
                          color: theme.palette.success.main,
                          width: 38,
                          height: 38,
                          mr: 1.5,
                        }}
                      >
                        <CheckCircle fontSize="small" />
                      </Avatar>
                      <Typography variant="subtitle2" color="text.secondary">
                        Success Rate
                      </Typography>
                    </Box>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: "bold",
                        ml: 6.5,
                        color: theme.palette.success.main,
                      }}
                    >
                      {kpiData.totalEmails === 0
                        ? 0
                        : Math.round(
                            (kpiData.valid / kpiData.totalEmails) * 100
                          )}
                      %
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Valid: {kpiData.valid}
                    </Typography>
                  </Box>
                </Grid>
                {/* Risky Rate */}
                <Grid item xs={12} sm={6} md={3}>
                  <Box>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Avatar
                        sx={{
                          bgcolor: alpha(theme.palette.warning.main, 0.1),
                          color: theme.palette.warning.main,
                          width: 38,
                          height: 38,
                          mr: 1.5,
                        }}
                      >
                        <Warning fontSize="small" />
                      </Avatar>
                      <Typography variant="subtitle2" color="text.secondary">
                        Risky Rate
                      </Typography>
                    </Box>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: "bold",
                        ml: 6.5,
                        color: theme.palette.warning.main,
                      }}
                    >
                      {kpiData.totalEmails === 0
                        ? 0
                        : Math.round(
                            (kpiData.risky / kpiData.totalEmails) * 100
                          )}
                      %
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Risky: {kpiData.risky}
                    </Typography>
                  </Box>
                </Grid>
                {/* Invalid Rate */}
                <Grid item xs={12} sm={6} md={3}>
                  <Box>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Avatar
                        sx={{
                          bgcolor: alpha(theme.palette.error.main, 0.1),
                          color: theme.palette.error.main,
                          width: 38,
                          height: 38,
                          mr: 1.5,
                        }}
                      >
                        <Error fontSize="small" />
                      </Avatar>
                      <Typography variant="subtitle2" color="text.secondary">
                        Invalid Rate
                      </Typography>
                    </Box>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: "bold",
                        ml: 6.5,
                        color: theme.palette.error.main,
                      }}
                    >
                      {kpiData.totalEmails === 0
                        ? 0
                        : Math.round(
                            (kpiData.invalid / kpiData.totalEmails) * 100
                          )}
                      %
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Invalid: {kpiData.invalid}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Trends and Results: Side by Side */}
        <Grid container item xs={12} spacing={3}>
          {/* Trends Chart (wider) */}
          <Grid item xs={12} md={8}>
            <StyledCard hoverEffect={false}>
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Verification Trends
                  </Typography>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel id="trend-filter-label">Range</InputLabel>
                    <Select
                      labelId="trend-filter-label"
                      id="trend-filter"
                      label="Range"
                      value={trendFilter}
                      onChange={(e) => setTrendFilter(e.target.value)}
                    >
                      <MenuItem value="7d">Last 7 Days</MenuItem>
                      <MenuItem value="30d">Last 30 Days</MenuItem>
                      <MenuItem value="all">All Time</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ height: 280 }}>
                  <Line data={trendsData} options={chartOptions} />
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>
          {/* Results Donut (narrower) */}
          <Grid item xs={12} md={4}>
            <StyledCard hoverEffect={false} sx={{ height: "100%" }}>
              <CardContent
                sx={{
                  p: 3,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Verification Results
                </Typography>
                <Grid container spacing={2} sx={{ height: "100%", flex: 1 }}>
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <VerificationDonutChart kpiData={kpiData} />
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    <Box sx={{ width: "100%" }}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 1.5 }}
                      >
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            bgcolor: theme.palette.success.main,
                            borderRadius: "50%",
                            mr: 1.5,
                          }}
                        />
                        <Typography variant="body2" sx={{ flex: 1 }}>
                          Valid
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {kpiData.valid.toLocaleString()}
                        </Typography>
                      </Box>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 1.5 }}
                      >
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            bgcolor: theme.palette.warning.main,
                            borderRadius: "50%",
                            mr: 1.5,
                          }}
                        />
                        <Typography variant="body2" sx={{ flex: 1 }}>
                          Risky
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {kpiData.risky.toLocaleString()}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            bgcolor: theme.palette.error.main,
                            borderRadius: "50%",
                            mr: 1.5,
                          }}
                        />
                        <Typography variant="body2" sx={{ flex: 1 }}>
                          Invalid
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {kpiData.invalid.toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </StyledCard>
          </Grid>
        </Grid>

        {/* Recent Verification Batches: Full Width */}
        <Grid container item xs={12} spacing={3}>
          <Grid item xs={12}>
            <StyledCard hoverEffect={false}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Recent Verification Batches
                </Typography>
                <Grid container spacing={2}>
                  {recentBatches.map((batch) => (
                    <Grid item xs={12} sm={6} md={4} key={batch.id}>
                      <Card
                        variant="outlined"
                        sx={{
                          borderRadius: 2,
                          boxShadow: `0 4px 12px ${alpha(
                            theme.palette.common.black,
                            0.04
                          )}`,
                          transition: "all 0.3s ease",
                          "&:hover": {
                            boxShadow: `0 6px 16px ${alpha(
                              theme.palette.common.black,
                              0.08
                            )}`,
                            transform: "translateY(-2px)",
                          },
                        }}
                      >
                        <CardContent sx={{ p: 2.5 }}>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              mb: 1.5,
                            }}
                          >
                            <Typography
                              variant="subtitle1"
                              sx={{ fontWeight: 600 }}
                            >
                              Batch #{batch.id}
                            </Typography>
                            <Tooltip title="More options">
                              <IconButton size="small">
                                <MoreVert fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: "block", mb: 1.5 }}
                          >
                            {new Date(batch.batch_time).toLocaleString(
                              undefined,
                              {
                                dateStyle: "medium",
                                timeStyle: "short",
                              }
                            )}
                          </Typography>
                          <Box sx={{ mb: 2 }}>
                            <LinearProgress
                              variant="determinate"
                              value={(batch.valid / batch.total) * 100}
                              sx={{
                                height: 6,
                                borderRadius: 3,
                                mb: 1.5,
                                bgcolor: alpha(theme.palette.success.main, 0.1),
                              }}
                            />
                            <Grid container spacing={1}>
                              <Grid item xs={4}>
                                <Tooltip title="Valid emails">
                                  <Box>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      Valid
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      fontWeight="bold"
                                      color="success.main"
                                    >
                                      {batch.valid}
                                    </Typography>
                                  </Box>
                                </Tooltip>
                              </Grid>
                              <Grid item xs={4}>
                                <Tooltip title="Risky emails">
                                  <Box>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      Risky
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      fontWeight="bold"
                                      color="warning.main"
                                    >
                                      {batch.risky}
                                    </Typography>
                                  </Box>
                                </Tooltip>
                              </Grid>
                              <Grid item xs={4}>
                                <Tooltip title="Invalid emails">
                                  <Box>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      Invalid
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      fontWeight="bold"
                                      color="error.main"
                                    >
                                      {batch.invalid}
                                    </Typography>
                                  </Box>
                                </Tooltip>
                              </Grid>
                            </Grid>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Chip
                              label={`${batch.total} Emails`}
                              size="small"
                              sx={{
                                borderRadius: 6,
                                height: 24,
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                color: theme.palette.primary.main,
                                fontWeight: 500,
                              }}
                            />
                            <Button
                              size="small"
                              endIcon={<ArrowForward fontSize="small" />}
                              onClick={() => handleBatchDetails(batch)}
                              sx={{
                                textTransform: "none",
                                fontWeight: 500,
                                color: theme.palette.text.primary,
                                "&:hover": {
                                  backgroundColor: alpha(
                                    theme.palette.primary.main,
                                    0.05
                                  ),
                                },
                              }}
                            >
                              Details
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </StyledCard>
          </Grid>
        </Grid>
      </Grid>

      {/* Drill-down Modal for Batch Details */}
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        closeAfterTransition
        aria-labelledby="batch-details-title"
        aria-describedby="batch-details-description"
      >
        <Fade in={modalOpen}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: { xs: "90%", sm: 500 },
              bgcolor: "background.paper",
              borderRadius: 3,
              boxShadow: `0 10px 40px ${alpha(
                theme.palette.common.black,
                0.2
              )}`,
              p: 0,
              overflow: "hidden",
            }}
          >
            {selectedBatch && (
              <>
                <Box
                  sx={{
                    bgcolor: theme.palette.primary.main,
                    color: "white",
                    p: 3,
                  }}
                >
                  <Typography
                    id="batch-details-title"
                    variant="h6"
                    component="h2"
                    fontWeight="bold"
                  >
                    Batch #{selectedBatch.id} Details
                  </Typography>
                  <Typography variant="subtitle2">
                    {new Date(selectedBatch.batch_time).toLocaleString(
                      undefined,
                      {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }
                    )}
                  </Typography>
                </Box>
                <Box sx={{ p: 3 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={7}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Verification Results
                      </Typography>
                      <Box sx={{ mb: 3 }}>
                        <Grid container spacing={2}>
                          <Grid item xs={4}>
                            <Paper
                              sx={{
                                p: 2,
                                textAlign: "center",
                                borderRadius: 2,
                                border: `1px solid ${alpha(
                                  theme.palette.success.main,
                                  0.2
                                )}`,
                                bgcolor: alpha(
                                  theme.palette.success.main,
                                  0.05
                                ),
                              }}
                            >
                              <Typography
                                variant="h5"
                                sx={{
                                  color: theme.palette.success.main,
                                  fontWeight: "bold",
                                }}
                              >
                                {selectedBatch.valid}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Valid
                              </Typography>
                            </Paper>
                          </Grid>
                          <Grid item xs={4}>
                            <Paper
                              sx={{
                                p: 2,
                                textAlign: "center",
                                borderRadius: 2,
                                border: `1px solid ${alpha(
                                  theme.palette.warning.main,
                                  0.2
                                )}`,
                                bgcolor: alpha(
                                  theme.palette.warning.main,
                                  0.05
                                ),
                              }}
                            >
                              <Typography
                                variant="h5"
                                sx={{
                                  color: theme.palette.warning.main,
                                  fontWeight: "bold",
                                }}
                              >
                                {selectedBatch.risky}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Risky
                              </Typography>
                            </Paper>
                          </Grid>
                          <Grid item xs={4}>
                            <Paper
                              sx={{
                                p: 2,
                                textAlign: "center",
                                borderRadius: 2,
                                border: `1px solid ${alpha(
                                  theme.palette.error.main,
                                  0.2
                                )}`,
                                bgcolor: alpha(theme.palette.error.main, 0.05),
                              }}
                            >
                              <Typography
                                variant="h5"
                                sx={{
                                  color: theme.palette.error.main,
                                  fontWeight: "bold",
                                }}
                              >
                                {selectedBatch.invalid}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Invalid
                              </Typography>
                            </Paper>
                          </Grid>
                        </Grid>
                      </Box>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Batch Information
                      </Typography>
                      <Box
                        sx={{
                          bgcolor: alpha(theme.palette.primary.main, 0.05),
                          borderRadius: 2,
                          p: 2,
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mb: 1,
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            Total Emails:
                          </Typography>
                          <Typography variant="body2" fontWeight="medium">
                            {selectedBatch.total}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mb: 1,
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            Success Rate:
                          </Typography>
                          <Typography
                            variant="body2"
                            fontWeight="medium"
                            color="success.main"
                          >
                            {selectedBatch.total === 0
                              ? 0
                              : Math.round(
                                  (selectedBatch.valid / selectedBatch.total) *
                                    100
                                )}
                            %
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            Processed On:
                          </Typography>
                          <Typography variant="body2" fontWeight="medium">
                            {new Date(selectedBatch.batch_time).toLocaleString(
                              undefined,
                              {
                                dateStyle: "medium",
                                timeStyle: "short",
                              }
                            )}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={5}>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          height: "100%",
                          minHeight: 200,
                        }}
                      >
                        <Box
                          sx={{
                            position: "relative",
                            width: 120,
                            height: 120,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <DonutLarge
                            sx={{
                              fontSize: 120,
                              color: theme.palette.primary.main,
                              opacity: 0.8,
                            }}
                          />
                          <Typography
                            variant="h4"
                            fontWeight="bold"
                            textAlign="center"
                            sx={{ position: "absolute" }}
                          >
                            {selectedBatch.total}
                          </Typography>
                        </Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 1 }}
                        >
                          Total Emails
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                  <Box
                    sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}
                  >
                    <Button
                      variant="outlined"
                      onClick={handleCloseModal}
                      sx={{
                        mr: 2,
                        borderRadius: 6,
                        px: 3,
                        textTransform: "none",
                      }}
                    >
                      Close
                    </Button>
                    <Button
                      variant="contained"
                      sx={{ borderRadius: 6, px: 3, textTransform: "none" }}
                      onClick={handleDownloadReport}
                    >
                      Download Report
                    </Button>
                  </Box>
                </Box>
              </>
            )}
          </Box>
        </Fade>
      </Modal>
    </Container>
  );
};

export default Dashboard;
