export default function Home() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="space-y-8 sm:space-y-12">
        <section className="text-center space-y-4 sm:space-y-6">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Welcome to Career Path Institute
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Your comprehensive learning management system for competitive exam preparation
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4">
            <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 w-full sm:w-auto">
              Get Started
            </button>
            <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 w-full sm:w-auto">
              Learn More
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Courses</h3>
            <p className="text-gray-600 mb-4">
              Structured learning paths with video content and materials
            </p>
            <p className="text-sm text-gray-500">
              Access comprehensive courses designed for competitive exam preparation
            </p>
          </div>

          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Mock Tests</h3>
            <p className="text-gray-600 mb-4">
              Practice with timed tests and performance analytics
            </p>
            <p className="text-sm text-gray-500">
              Simulate real exam conditions with our advanced testing system
            </p>
          </div>

          <div className="border rounded-lg p-6 md:col-span-2 lg:col-span-1">
            <h3 className="text-lg font-semibold mb-2">Study Materials</h3>
            <p className="text-gray-600 mb-4">
              Books, PDFs, and current affairs content
            </p>
            <p className="text-sm text-gray-500">
              Comprehensive study resources to supplement your learning
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
