import { Modal, ModalBody, ModalContent, ModalHeader } from "@nextui-org/react";
import useSWR from "swr";
import { DataDump } from "./DataDump";
import { useAuth } from "../auth";
import type { StorageFile } from "@superstreamer/api/client";

interface FilePreviewProps {
  path: string | null;
  onClose(): void;
}

export function FilePreview({ path, onClose }: FilePreviewProps) {
  const { api } = useAuth();
  const { data } = useSWR(["file-preview", path], async ([_, path]) => {
    if (!path) {
      return null;
    }

    const result = await api.storage.file.get({ query: { path } });
    if (result.error) {
      throw result.error;
    }
    return result.data;
  });

  return (
    <Modal
      isOpen={path !== null}
      onClose={onClose}
      scrollBehavior="outside"
      size="4xl"
    >
      <ModalContent>
        <ModalHeader>Preview</ModalHeader>
        <ModalBody className="px-6 pt-0 pb-4">
          {data ? <Preview file={data} /> : null}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

function Preview({ file }: { file: StorageFile }) {
  if (file.mode === "payload") {
    return <DataDump data={file.payload} />;
  }
  if (file.mode === "url") {
    if (file.type === "video") {
      return (
        <video
          src={file.url}
          controls
          className="w-full aspect-video max-w-lg mx-auto"
        />
      );
    }
  }
  return null;
}
