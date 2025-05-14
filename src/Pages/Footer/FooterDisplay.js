import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Typography,
  Link,
  Divider,
  Stack,
  IconButton,
  Button,
} from "@mui/material";
import { apiClient } from "../../utils/api";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";
import { useNavigate } from "react-router-dom";

const FooterDisplay = () => {
  const [footer, setFooter] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFooter = async () => {
      try {
        const response = await apiClient.get("/api/footer");
        if (response.data.success && response.data.data) {
          setFooter(response.data.data);
        }
      } catch (error) {
        setFooter(null);
      }
    };
    fetchFooter();
  }, []);

  if (!footer) return <Typography>Không có dữ liệu footer.</Typography>;

  return (
    <Box sx={{ background: "#f9f9fb", p: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/footer/edit")}
        >
          Chỉnh sửa footer
        </Button>
      </Box>
      {/* Top Info */}
      <Grid container spacing={2} justifyContent="center" mb={4}>
        {footer.topInfo.map((info, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Box sx={{ textAlign: "center" }}>
              {info.icon && (
                <i
                  className={info.icon}
                  style={{ fontSize: 32, color: "#1976d2" }}
                ></i>
              )}
              <Typography variant="subtitle1" mt={1}>
                {info.text}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
      <Divider sx={{ mb: 4 }} />
      {/* Categories */}
      <Grid container spacing={4} mb={4}>
        {footer.categories.map((cat, idx) => (
          <Grid item xs={12} sm={6} md={2.4} key={idx}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              {cat.title}
            </Typography>
            <Stack spacing={0.5}>
              {cat.items.map((item, i) => (
                <Typography variant="body2" color="text.secondary" key={i}>
                  {item}
                </Typography>
              ))}
            </Stack>
          </Grid>
        ))}
      </Grid>
      <Divider sx={{ mb: 4 }} />
      {/* Contact & App Download */}
      <Grid container spacing={4} alignItems="center" mb={4}>
        <Grid item xs={12} md={4}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Liên hệ
          </Typography>
          <Typography>
            Số điện thoại: <b>{footer.contactInfo.phone}</b>
          </Typography>
          <Typography>
            Giờ làm việc: {footer.contactInfo.workingHours}
          </Typography>
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {footer.appDownload.title}
          </Typography>
          <Typography>{footer.appDownload.subtitle}</Typography>
          <Box mt={1}>
            <Link
              href={footer.appDownload.googlePlayLink}
              target="_blank"
              rel="noopener"
              sx={{ mr: 2 }}
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                alt="Google Play"
                height={40}
              />
            </Link>
            <Link
              href={footer.appDownload.appStoreLink}
              target="_blank"
              rel="noopener"
            >
              <img
                src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                alt="App Store"
                height={40}
              />
            </Link>
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Mạng xã hội
          </Typography>
          <Stack direction="row" spacing={2} mt={1}>
            {footer.socialMedia.facebook && (
              <IconButton
                href={footer.socialMedia.facebook}
                target="_blank"
                rel="noopener"
                color="primary"
              >
                <FacebookIcon />
              </IconButton>
            )}
            {footer.socialMedia.twitter && (
              <IconButton
                href={footer.socialMedia.twitter}
                target="_blank"
                rel="noopener"
                color="primary"
              >
                <TwitterIcon />
              </IconButton>
            )}
            {footer.socialMedia.instagram && (
              <IconButton
                href={footer.socialMedia.instagram}
                target="_blank"
                rel="noopener"
                color="primary"
              >
                <InstagramIcon />
              </IconButton>
            )}
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FooterDisplay;
