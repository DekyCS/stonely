import { FeatureSelector } from "@/components/feature-selector";
import { Section } from "@/components/section";
import { codeToHtml } from "shiki";

interface FeatureOption {
  id: number;
  title: string;
  description: string;
  code: string;
}

const featureOptions: FeatureOption[] = [
  {
    id: 1,
    title: "Basic Rock Analysis",
    description: "Upload a rock photo and get instant mineral identification.",
    code: `import { RocklyAPI } from 'rockly-sdk';

const rockly = new RocklyAPI();

const analyzeRock = async (imageFile) => {
    // Upload rock image for analysis
    const analysis = await rockly.analyze({
        image: imageFile,
        includeVisualization: true,
        detailLevel: 'standard'
    });
    
    // Get mineral composition
    console.log('Minerals found:', analysis.minerals);
    console.log('Primary composition:', analysis.primaryMinerals);
    console.log('Rock type:', analysis.rockType);
    
    // Access 3D model
    const model3D = analysis.visualization.model3D;
    console.log('3D model URL:', model3D.url);
};

// Analyze uploaded rock
analyzeRock(uploadedFile);`,
  },
  {
    id: 2,
    title: "Advanced Geological Analysis",
    description:
      "Get detailed geological information including formation processes and age estimation.",
    code: `import { RocklyAPI } from 'rockly-sdk';

const rockly = new RocklyAPI();

const detailedAnalysis = async (imageFile) => {
    // Advanced analysis with geological context
    const result = await rockly.analyze({
        image: imageFile,
        analysisType: 'comprehensive',
        includeGeology: true,
        include3D: true,
        educationalContent: true
    });
    
    // Geological information
    console.log('Formation process:', result.geology.formation);
    console.log('Estimated age:', result.geology.age);
    console.log('Geological era:', result.geology.era);
    
    // Educational content
    console.log('Learning materials:', result.education.content);
    console.log('Related specimens:', result.education.relatedSamples);
    
    return result;
};

detailedAnalysis(rockImage);`,
  },
  {
    id: 3,
    title: "3D Visualization & Interaction",
    description: "Generate interactive 3D models with mineral mapping and exploration features.",
    code: `import { RocklyAPI, Viewer3D } from 'rockly-sdk';

const rockly = new RocklyAPI();
const viewer = new Viewer3D();

const create3DModel = async (imageFile) => {
    // Generate 3D model with mineral mapping
    const analysis = await rockly.analyze({
        image: imageFile,
        generate3D: true,
        mapMinerals: true,
        highResolution: true
    });
    
    // Load into 3D viewer
    await viewer.loadModel(analysis.model3D);
    
    // Configure mineral highlighting
    viewer.highlightMinerals({
        quartz: '#ffffff',
        feldspar: '#ffaaaa', 
        mica: '#000000',
        calcite: '#aaffaa'
    });
    
    // Enable interactive features
    viewer.enableRotation();
    viewer.enableZoom();
    viewer.enableMineralTooltips();
    
    return viewer;
};

create3DModel(rockPhoto);`,
  },
  {
    id: 4,
    title: "Batch Processing for Research",
    description: "Process multiple rock specimens for research and educational projects.",
    code: `import { RocklyAPI } from 'rockly-sdk';

const rockly = new RocklyAPI();

const batchAnalysis = async (imageArray) => {
    // Process multiple samples
    const results = await rockly.batchAnalyze({
        images: imageArray,
        outputFormat: 'research',
        includeStatistics: true,
        generateReport: true
    });
    
    // Statistical analysis across samples
    console.log('Sample count:', results.statistics.totalSamples);
    console.log('Mineral diversity:', results.statistics.uniqueMinerals);
    console.log('Most common minerals:', results.statistics.commonMinerals);
    
    // Generate comparative report
    const report = await rockly.generateReport({
        data: results,
        format: 'pdf',
        includeCharts: true,
        includeImages: true
    });
    
    return { results, report };
};

// Analyze field collection
batchAnalysis(fieldSamples);`,
  },
  {
    id: 5,
    title: "Educational Integration",
    description: "Integrate Rockly into educational platforms and curriculum.",
    code: `import { RocklyAPI, EducationMode } from 'rockly-sdk';

const rockly = new RocklyAPI();
const eduMode = new EducationMode();

const educationalAnalysis = async (studentImage, gradeLevel) => {
    // Configure for educational context
    const analysis = await rockly.analyze({
        image: studentImage,
        mode: 'educational',
        gradeLevel: gradeLevel,
        includeQuiz: true,
        simplifiedTerms: true
    });
    
    // Educational content tailored to level
    console.log('Simple explanation:', analysis.education.explanation);
    console.log('Fun facts:', analysis.education.facts);
    console.log('Quiz questions:', analysis.education.quiz);
    
    // Track learning progress
    eduMode.trackProgress({
        studentId: 'student123',
        rockType: analysis.rockType,
        accuracy: analysis.confidence,
        completionTime: Date.now()
    });
    
    return analysis;
};

educationalAnalysis(studentRock, 'middle-school');`,
  },
];

export async function Examples() {
  const features = await Promise.all(
    featureOptions.map(async (feature) => ({
      ...feature,
      code: await codeToHtml(feature.code, {
        lang: "typescript",
        theme: "github-dark",
      }),
    }))
  );

  return (
    <Section id="examples">
      <div className="border-x border-t">
        <FeatureSelector features={features} />
      </div>
    </Section>
  );
}
