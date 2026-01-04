utils/hypothesisTesting.ts
import DatabaseClient from '@/core/api/DatabaseClient';

Types for statistical tests
export interface TTestParams {
  groupA: string;
  groupB: string;
  column: string;
  alternative?: 'two-sided' | 'less' | 'greater';
  alpha?: number;
}

export interface ChiSquareParams {
  observedColumn: string;
  expectedColumn?: string;
  categories?: string[];
}

export interface AnovaParams {
  groups: string[];
  column: string;
}

export interface HypothesisTestResult {
  testType: string;
  datasetId: string;
  pValue: number;
  statistic: number;
  significant: boolean;
  conclusion: string;
  confidenceInterval?: [number, number];
  degreesOfFreedom?: number;
  effectSize?: number;
}

Main hypothesis test function - this replaces performStatisticalTest
export async function runHypothesisTest(
  datasetId: string, 
  testType: string, 
  parameters: any
): Promise<HypothesisTestResult> {
  try {
    switch (testType.toLowerCase()) {
      case 't-test':
      case 'ttest':
        return await performTTest(datasetId, parameters as TTestParams);
      
      case 'chi-square':
      case 'chisquare':
      case 'chi2':
        return await performChiSquareTest(datasetId, parameters as ChiSquareParams);
      
      case 'anova':
        return await performAnovaTest(datasetId, parameters as AnovaParams);
      
      default:
        throw new Error(`Unsupported test type: ${testType}`);
    }
  } catch (error) {
    console.error('Error in hypothesis test:', error);
    throw error;
  }
}

T-Test Implementation (Independent Samples)
async function performTTest(
  datasetId: string, 
  params: TTestParams
): Promise<HypothesisTestResult> {
  try {
    // Fetch dataset data
    const data = await fetchDatasetData(datasetId);
    
    if (!data || data.length === 0) {
      throw new Error('Dataset is empty or not found');
    }

    // Extract groups
    const groupAData = data
      .filter(row => row[params.groupA] !== undefined && row[params.groupA] !== null)
      .map(row => parseFloat(row[params.column]));
    
    const groupBData = data
      .filter(row => row[params.groupB] !== undefined && row[params.groupB] !== null)
      .map(row => parseFloat(row[params.column]));

    if (groupAData.length === 0 || groupBData.length === 0) {
      throw new Error('Insufficient data for groups');
    }

    // Calculate means
    const meanA = groupAData.reduce((sum, val) => sum + val, 0) / groupAData.length;
    const meanB = groupBData.reduce((sum, val) => sum + val, 0) / groupBData.length;

    // Calculate variances
    const varianceA = groupAData.reduce((sum, val) => sum + Math.pow(val - meanA, 2), 0) / (groupAData.length - 1);
    const varianceB = groupBData.reduce((sum, val) => sum + Math.pow(val - meanB, 2), 0) / (groupBData.length - 1);

    // Calculate pooled standard deviation
    const pooledVariance = ((groupAData.length - 1) * varianceA + (groupBData.length - 1) * varianceB) / 
                          (groupAData.length + groupBData.length - 2);
    const pooledStd = Math.sqrt(pooledVariance);

    // Calculate t-statistic
    const stdError = pooledStd * Math.sqrt(1/groupAData.length + 1/groupBData.length);
    const tStatistic = (meanA - meanB) / stdError;

    // Degrees of freedom
    const df = groupAData.length + groupBData.length - 2;

    // Calculate p-value (simplified - in real implementation, use proper t-distribution)
    const pValue = calculatePValueFromT(tStatistic, df, params.alternative || 'two-sided');
    
    // Effect size (Cohen's d)
    const effectSize = Math.abs(meanA - meanB) / pooledStd;

    const alpha = params.alpha || 0.05;
    const significant = pValue < alpha;

    return {
      testType: 't-test',
      datasetId,
      pValue,
      statistic: tStatistic,
      significant,
      degreesOfFreedom: df,
      effectSize,
      confidenceInterval: [
        (meanA - meanB) - 2.064 * stdError, // 95% CI for df=30
        (meanA - meanB) + 2.064 * stdError
      ],
      conclusion: significant 
        ? `Reject null hypothesis: There is a significant difference between ${params.groupA} and ${params.groupB}`
        : `Fail to reject null hypothesis: No significant difference between ${params.groupA} and ${params.groupB}`
    };
  } catch (error) {
    console.error('Error in t-test:', error);
    throw error;
  }
}

Chi-Square Test Implementation
async function performChiSquareTest(
  datasetId: string, 
  params: ChiSquareParams
): Promise<HypothesisTestResult> {
  try {
    const data = await fetchDatasetData(datasetId);
    
    if (!data || data.length === 0) {
      throw new Error('Dataset is empty or not found');
    }

    // Create contingency table
    const observed: { [key: string]: number } = {};
    
    data.forEach(row => {
      const category = row[params.observedColumn];
      if (category !== undefined && category !== null) {
        observed[category] = (observed[category] || 0) + 1;
      }
    });

    // Calculate expected frequencies (uniform distribution if no expected provided)
    const total = Object.values(observed).reduce((sum, count) => sum + count, 0);
    const categories = Object.keys(observed);
    const expectedFrequency = total / categories.length;

    const expected: { [key: string]: number } = {};
    categories.forEach(category => {
      expected[category] = expectedFrequency;
    });

    // Calculate chi-square statistic
    let chiSquare = 0;
    categories.forEach(category => {
      const obs = observed[category];
      const exp = expected[category];
      chiSquare += Math.pow(obs - exp, 2) / exp;
    });

    // Degrees of freedom
    const df = categories.length - 1;

    // Calculate p-value
    const pValue = calculatePValueFromChiSquare(chiSquare, df);
    
    const alpha = 0.05;
    const significant = pValue < alpha;

    return {
      testType: 'chi-square',
      datasetId,
      pValue,
      statistic: chiSquare,
      significant,
      degreesOfFreedom: df,
      conclusion: significant
        ? `Reject null hypothesis: There is a significant association for ${params.observedColumn}`
        : `Fail to reject null hypothesis: No significant association for ${params.observedColumn}`
    };
  } catch (error) {
    console.error('Error in chi-square test:', error);
    throw error;
  }
}

ANOVA Test Implementation
async function performAnovaTest(
  datasetId: string, 
  params: AnovaParams
): Promise<HypothesisTestResult> {
  try {
    const data = await fetchDatasetData(datasetId);
    
    if (!data || data.length === 0) {
      throw new Error('Dataset is empty or not found');
    }

    // Group data by categories
    const groups: { [key: string]: number[] } = {};
    
    params.groups.forEach(group => {
      groups[group] = data
        .filter(row => row[group] !== undefined && row[group] !== null)
        .map(row => parseFloat(row[params.column]))
        .filter(val => !isNaN(val));
    });

    // Remove empty groups
    Object.keys(groups).forEach(group => {
      if (groups[group].length === 0) {
        delete groups[group];
      }
    });

    const groupKeys = Object.keys(groups);
    if (groupKeys.length < 2) {
      throw new Error('ANOVA requires at least 2 groups with data');
    }

    // Calculate overall mean
    const allData = groupKeys.flatMap(group => groups[group]);
    const overallMean = allData.reduce((sum, val) => sum + val, 0) / allData.length;

    // Calculate Sum of Squares Between (SSB)
    let ssb = 0;
    groupKeys.forEach(group => {
      const groupMean = groups[group].reduce((sum, val) => sum + val, 0) / groups[group].length;
      ssb += groups[group].length * Math.pow(groupMean - overallMean, 2);
    });

    // Calculate Sum of Squares Within (SSW)
    let ssw = 0;
    groupKeys.forEach(group => {
      const groupMean = groups[group].reduce((sum, val) => sum + val, 0) / groups[group].length;
      ssw += groups[group].reduce((sum, val) => sum + Math.pow(val - groupMean, 2), 0);
    });

    // Degrees of freedom
    const dfBetween = groupKeys.length - 1;
    const dfWithin = allData.length - groupKeys.length;

    // Mean squares
    const msBetween = ssb / dfBetween;
    const msWithin = ssw / dfWithin;

    // F-statistic
    const fStatistic = msBetween / msWithin;

    // Calculate p-value
    const pValue = calculatePValueFromF(fStatistic, dfBetween, dfWithin);
    
    const alpha = 0.05;
    const significant = pValue < alpha;

    return {
      testType: 'anova',
      datasetId,
      pValue,
      statistic: fStatistic,
      significant,
      degreesOfFreedom: dfBetween,
      conclusion: significant
        ? `Reject null hypothesis: There are significant differences between the groups`
        : `Fail to reject null hypothesis: No significant differences between the groups`
    };
  } catch (error) {
    console.error('Error in ANOVA test:', error);
    throw error;
  }
}

Helper function to fetch dataset data
async function fetchDatasetData(datasetId: string): Promise<any[]> {
  try {
    // This would typically query your database
    const dbClient = new DatabaseClient();
    await dbClient.connect();
    
    const result = await dbClient.query(
      'SELECT * FROM datasets WHERE id = $1',
      [datasetId]
    );
    
    return result.rows;
  } catch (error) {
    console.error('Error fetching dataset data:', error);
    throw error;
  }
}

Simplified p-value calculations (in real implementation, use proper statistical libraries)
function calculatePValueFromT(t: number, df: number, alternative: string): number {
  // Simplified approximation - use proper t-distribution in production
  const absT = Math.abs(t);
  if (alternative === 'two-sided') {
    return 2 * (1 - normalCDF(absT));
  } else {
    return 1 - normalCDF(absT);
  }
}

function calculatePValueFromChiSquare(chiSquare: number, df: number): number {
  // Simplified approximation
  return Math.exp(-chiSquare / 2) * Math.pow(chiSquare, df/2 - 1);
}

function calculatePValueFromF(f: number, df1: number, df2: number): number {
  // Simplified approximation
  return Math.pow(1 + (f * df1) / df2, -(df1 + df2) / 2);
}

Standard normal cumulative distribution function (approximation)
function normalCDF(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp(-x * x / 2);
  let probability = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  
  if (x > 0) {
    probability = 1 - probability;
  }
  
  return probability;
}

Export individual test functions if needed elsewhere
export { performAnovaTest, performChiSquareTest, performTTest };
