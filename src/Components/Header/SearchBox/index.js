import React, { useRef, useEffect } from "react";
import { CiSearch } from "react-icons/ci";
import { IoMdClose } from "react-icons/io";

const SearchBox = ({ isOverlay, onClose }) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOverlay && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOverlay]);

  return (
    <div className="searchBox position-relative d-flex align-items-center">
      <CiSearch className="mr-2" />
      <input ref={inputRef} type="text" placeholder="Tìm kiếm tại đây...." />
      {isOverlay && (
        <IoMdClose
          onClick={onClose}
          style={{
            cursor: "pointer",
            fontSize: "20px",
            marginLeft: "auto",
            marginRight: "5px",
          }}
        />
      )}
    </div>
  );
};

export default SearchBox;
