import { notFound } from 'next/navigation';

// Any path that isn't a real page lands here so the 404 renders inside the
// mode layout (with the right fonts, tokens and data-mode) instead of Next's
// bare default.
export default function Missing() {
  notFound();
}
