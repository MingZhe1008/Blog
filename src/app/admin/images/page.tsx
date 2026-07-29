import { listUploadedImages } from "@/server-actions/upload";
import { ImagesPageView } from "./images-page-view";

export const dynamic = "force-dynamic";

export default async function ImagesPage() {
  const images = await listUploadedImages();
  return <ImagesPageView images={images} />;
}
