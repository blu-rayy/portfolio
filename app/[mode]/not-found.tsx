import Link from 'next/link';
import { Kristian, MOOD_LABELS } from '@/components/fun/art/Kristian';
import { loadFunCopy } from '@/lib/content/load';

export default function NotFound() {
  const { notFound: copy } = loadFunCopy();
  return (
    <main id="main" tabIndex={-1} className="lost">
      <Kristian
        mood="sad"
        className="lost-art"
        idPrefix="kr404"
        label={MOOD_LABELS.sad}
      />
      <div className="lost-text">
        <h1>{copy.title}</h1>
        <p>{copy.body}</p>
        <Link href="/" className="btn btn-primary">
          {copy.home}
        </Link>
      </div>
    </main>
  );
}
