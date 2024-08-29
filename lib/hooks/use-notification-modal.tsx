import { ReactNode, useState } from "react";
import NotificationModal from "~/components/modal/notification-modal";

export default function useNotificationModal({
  title,
  description,
  variant = "default",
}: {
  title: string;
  description: string;
  variant?: "default" | "danger";
}): {
  setOpen: () => void;
  modal: ReactNode;
} {
  const [open, setOpen] = useState(false);

  return {
    setOpen: () => setOpen(true),
    modal: (
      <NotificationModal
        title={title}
        description={description}
        open={open}
        variant={variant}
        setClose={() => setOpen(false)}
      />
    ),
  };
}
