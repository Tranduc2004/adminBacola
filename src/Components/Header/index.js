import React, { useState } from "react";
import Button from "@mui/material/Button";
import { CiLight } from "react-icons/ci";
import { FaSearch } from "react-icons/fa";
import SearchBox from "./SearchBox";
import Logo from "./Logo";
import { MdMenuOpen } from "react-icons/md";
import { Container, Row, Col } from "react-bootstrap";
import { IoMdMenu } from "react-icons/io";
import { useSidebar } from "../../context/SidebarContext";
import UserMenu from "./UserMenu";
import NotificationsMenu from "./NotificationsMenu";
import CartMenu from "./CartMenu";
import EmailMenu from "./EmailMenu";
import { MdNightlight } from "react-icons/md";
import { useTheme } from "../../context/ThemeContext";

const Header = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { isSidebarOpen, toggleSidebar } = useSidebar();
  const { isDarkMode, toggleTheme } = useTheme();

  const handleSearchClick = () => {
    setIsSearchOpen(true);
  };

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
  };

  return (
    <>
      <header className={`header ${isDarkMode ? "dark" : ""}`}>
        <Container fluid>
          <Row className="align-items-center" style={{ height: "80px" }}>
            <Col className="d-flex align-items-center">
              <Button className="rounded-circle mr-3" onClick={toggleSidebar}>
                {isSidebarOpen ? <MdMenuOpen /> : <IoMdMenu />}
              </Button>
              <Logo />
            </Col>
            <div className="col-sm-3 d-flex align-items-center part2 pl-4">
              <SearchBox isOverlay={false} />
            </div>
            <div className="col-sm-7 d-flex align-items-center justify-content-end part3">
              <Button
                className="theme-toggle-btn rounded-circle mr-3"
                onClick={toggleTheme}
                title={
                  isDarkMode ? "Switch to light mode" : "Switch to dark mode"
                }
              >
                {isDarkMode ? (
                  <MdNightlight size={20} />
                ) : (
                  <CiLight size={20} />
                )}
              </Button>
              <Button
                className="rounded-circle mr-3 mobile-search-btn"
                onClick={handleSearchClick}
              >
                <FaSearch />
              </Button>
              <CartMenu />
              <EmailMenu />
              <NotificationsMenu />
              <UserMenu />
            </div>
          </Row>
        </Container>
      </header>

      {/* Search Overlay */}
      <div
        className={`search-overlay ${isSearchOpen ? "active" : ""}`}
        onClick={handleCloseSearch}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{ width: "100%", padding: "0 15px" }}
        >
          <SearchBox isOverlay={true} onClose={handleCloseSearch} />
        </div>
      </div>
    </>
  );
};

export default Header;
