import { ReactNode, useState } from "react";
import NotificationModal from "~/components/modal/notification-modal";

export default function useNotificationModal({
  title,
  description,
}: {
  title: string;
  description: string;
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
        setClose={() => setOpen(false)}
      />
    ),
  };
}
