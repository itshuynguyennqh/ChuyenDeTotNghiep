import { createTheme } from '@mui/material/styles';

// Tạo một theme tùy chỉnh
const theme = createTheme({
  // Bảng màu (Palette)
  palette: {
    // Thay thế bằng mã màu từ Figma của bạn
    primary: {
      main: '#1976d2', // Ví dụ: màu xanh dương chính
    },
    secondary: {
      main: '#dc004e', // Ví dụ: màu hồng phụ
    },
    text: {
      primary: '#333333', // Ví dụ: màu chữ chính
      secondary: '#555555', // Ví dụ: màu chữ phụ
    }
  },
  // Kiểu chữ (Typography)
  typography: {
    // Áp dụng font Montserrat cho toàn bộ ứng dụng
    fontFamily: 'Montserrat, sans-serif',
    h4: {
      fontWeight: 700, // Tên sản phẩm đậm
    },
    h5: {
      fontWeight: 500, // Giá sản phẩm
    },
  },
});

export default theme;
