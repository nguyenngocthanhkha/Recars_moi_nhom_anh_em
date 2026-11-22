import { useEffect, useRef } from 'react';

// Quản lý vòng đời và thao tác đóng của dialog, tách khỏi nội dung hiển thị.
export default function useDialog(onClose) {
  // ref liên kết hook với thẻ dialog thật; mở khi xuất hiện, đóng khi gỡ khỏi trang.
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  // Chỉ đóng khi bấm nền bên ngoài nội dung, không đóng khi bấm bên trong hộp.
  const closeOnBackdrop = (event) => {
    if (event.target === ref.current) onClose();
  };
  return { ref, closeOnBackdrop };
}
