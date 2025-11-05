import { MadeWithDyad } from "@/components/made-with-dyad";
import SourceValidator from "@/components/SourceValidator"; // Import the new component

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          Multi-LLM Enrichment Agent Platform
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Validate source content for accuracy and relevance.
        </p>
      </div>
      <SourceValidator /> {/* Render the new component */}
      <MadeWithDyad />
    </div>
  );
};

export default Index;