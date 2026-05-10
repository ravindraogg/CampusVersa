import React, { useState, Suspense, lazy } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { 
  FlaskConical, ArrowLeft, ChevronRight, Sparkles, Atom, Beaker, Leaf, 
  Search, Filter, Grid, List, Info, Loader2, Shapes, Hash, Ruler, 
  MoveRight, HelpCircle, Scale, PenTool, Bird, Droplets, Utensils, 
  Coins, Users, Paintbrush, Apple, Carrot, Home, Flame, Table, FileJson,
  BookOpen, GraduationCap, School, Building2, Zap, Brain, Compass, Play, MapPin, Network, Eye, Wind,Thermometer ,FileCode, Smartphone, Layout, Cpu, Database, Code2, Terminal, RotateCcw, Layers, Globe, CheckCircle2, Cloud, Rocket, Shield ,FileText ,
  Sun, Activity, Box, Volume2, VolumeX
} from 'lucide-react';

const API_URL = import.meta.env.VITE_BACKEND_URL;
const IS_AI_ENABLED = import.meta.env.VITE_AI_MODEL === 'True';

const LANGUAGES = [
  { code: 'hi', name: 'Hindi' },
  { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' },
  { code: 'kn', name: 'Kannada' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'bn', name: 'Bengali' },
  { code: 'mr', name: 'Marathi' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'pa', name: 'Punjabi' },
  { code: 'or', name: 'Odia' },
  { code: 'as', name: 'Assamese' },
  { code: 'ur', name: 'Urdu' },
  { code: 'en', name: 'English' },
];

// --- LAZY LOADING LABS (HIERARCHICAL) ---
// Early School Education
const ShapeSorter = lazy(() => import('./labs/EarlySchool/Class1').then(m => ({ default: m.ShapeSorter })));
const BeadCounter = lazy(() => import('./labs/EarlySchool/Class1').then(m => ({ default: m.BeadCounter })));
const HandSpanMeasure = lazy(() => import('./labs/EarlySchool/Class1').then(m => ({ default: m.HandSpanMeasure })));

const RollSlideTest = lazy(() => import('./labs/EarlySchool/Class2').then(m => ({ default: m.RollSlideTest })));
const JarEstimator = lazy(() => import('./labs/EarlySchool/Class2').then(m => ({ default: m.JarEstimator })));
const BalanceScale = lazy(() => import('./labs/EarlySchool/Class2').then(m => ({ default: m.BalanceScale })));
const OutlineTracer = lazy(() => import('./labs/EarlySchool/Class2').then(m => ({ default: m.OutlineTracer })));

const AnimalClassifier = lazy(() => import('./labs/EarlySchool/Class3').then(m => ({ default: m.AnimalClassifier })));
const WaterSolubility = lazy(() => import('./labs/EarlySchool/Class3').then(m => ({ default: m.WaterSolubility })));
const LeafTexture = lazy(() => import('./labs/EarlySchool/Class3').then(m => ({ default: m.LeafTexture })));
const UtensilMatcher = lazy(() => import('./labs/EarlySchool/Class3').then(m => ({ default: m.UtensilMatcher })));
const TokenMath = lazy(() => import('./labs/EarlySchool/Class3').then(m => ({ default: m.TokenMath })));
const BeadSharer = lazy(() => import('./labs/EarlySchool/Class3').then(m => ({ default: m.BeadSharer })));
const MiniPaint = lazy(() => import('./labs/EarlySchool/Class3').then(m => ({ default: m.MiniPaint })));

const FoodMapper = lazy(() => import('./labs/EarlySchool/Class4').then(m => ({ default: m.FoodMapper })));
const FreshnessTest = lazy(() => import('./labs/EarlySchool/Class4').then(m => ({ default: m.FreshnessTest })));
const HouseBuilder = lazy(() => import('./labs/EarlySchool/Class4').then(m => ({ default: m.HouseBuilder })));
const SpiceRiddle = lazy(() => import('./labs/EarlySchool/Class4').then(m => ({ default: m.SpiceRiddle })));
const MatchstickTables = lazy(() => import('./labs/EarlySchool/Class4').then(m => ({ default: m.MatchstickTables })));
const FractionFolder = lazy(() => import('./labs/EarlySchool/Class4').then(m => ({ default: m.FractionFolder })));

const AntSenseLab = lazy(() => import('./labs/EarlySchool/Class5').then(m => ({ default: m.AntSenseLab })));
const GerminationLab = lazy(() => import('./labs/EarlySchool/Class5').then(m => ({ default: m.GerminationLab })));
const FloatationLab = lazy(() => import('./labs/EarlySchool/Class5').then(m => ({ default: m.FloatationLab })));
const AngleTester = lazy(() => import('./labs/EarlySchool/Class5').then(m => ({ default: m.AngleTester })));
const MagicTop = lazy(() => import('./labs/EarlySchool/Class5').then(m => ({ default: m.MagicTop })));
const ScratchBasics = lazy(() => import('./labs/EarlySchool/Class5').then(m => ({ default: m.ScratchBasics })));
const MapPointing = lazy(() => import('./labs/EarlySchool/Class5').then(m => ({ default: m.MapPointing })));
const FlowchartLab = lazy(() => import('./labs/EarlySchool/Class5').then(m => ({ default: m.FlowchartLab })));

// Middle School Education
const StarchTest = lazy(() => import('./labs/MiddleSchool/Class6').then(m => ({ default: m.StarchTest })));
const ProteinTest = lazy(() => import('./labs/MiddleSchool/Class6').then(m => ({ default: m.ProteinTest })));
const FatsTest = lazy(() => import('./labs/MiddleSchool/Class6').then(m => ({ default: m.FatsTest })));
const SolubilityTest = lazy(() => import('./labs/MiddleSchool/Class6').then(m => ({ default: m.SolubilityTest })));
const TransparencyTest = lazy(() => import('./labs/MiddleSchool/Class6').then(m => ({ default: m.TransparencyTest })));
const FiltrationLab = lazy(() => import('./labs/MiddleSchool/Class6').then(m => ({ default: m.FiltrationLab })));
const EvaporationLab = lazy(() => import('./labs/MiddleSchool/Class6').then(m => ({ default: m.EvaporationLab })));
const TranspirationLab = lazy(() => import('./labs/MiddleSchool/Class6').then(m => ({ default: m.TranspirationLab })));
const RootSystems = lazy(() => import('./labs/MiddleSchool/Class6').then(m => ({ default: m.RootSystems })));
const SimpleCircuit = lazy(() => import('./labs/MiddleSchool/Class6').then(m => ({ default: m.SimpleCircuit })));

// Class 7
const PhotosynthesisLab = lazy(() => import('./labs/MiddleSchool/Class7').then(m => ({ default: m.PhotosynthesisLab })));
const ThermometerLab = lazy(() => import('./labs/MiddleSchool/Class7').then(m => ({ default: m.ThermometerLab })));
const ConductionLab = lazy(() => import('./labs/MiddleSchool/Class7').then(m => ({ default: m.ConductionLab })));
const LitmusLab = lazy(() => import('./labs/MiddleSchool/Class7').then(m => ({ default: m.LitmusLab })));
const TurmericLab = lazy(() => import('./labs/MiddleSchool/Class7').then(m => ({ default: m.TurmericLab })));
const MagnesiumLab = lazy(() => import('./labs/MiddleSchool/Class7').then(m => ({ default: m.MagnesiumLab })));
const ChemicalChangeLab = lazy(() => import('./labs/MiddleSchool/Class7').then(m => ({ default: m.ChemicalChangeLab })));
const ElectromagnetLab = lazy(() => import('./labs/MiddleSchool/Class7').then(m => ({ default: m.ElectromagnetLab })));
const NewtonDiscLab = lazy(() => import('./labs/MiddleSchool/Class7').then(m => ({ default: m.NewtonDiscLab })));

// Class 8
const BreadMouldLab = lazy(() => import('./labs/MiddleSchool/Class8').then(m => ({ default: m.BreadMouldLab })));
const CombustionLab = lazy(() => import('./labs/MiddleSchool/Class8').then(m => ({ default: m.CombustionLab })));
const CandleZonesLab = lazy(() => import('./labs/MiddleSchool/Class8').then(m => ({ default: m.CandleZonesLab })));
const PressureLab = lazy(() => import('./labs/MiddleSchool/Class8').then(m => ({ default: m.PressureLab })));
const FrictionLab = lazy(() => import('./labs/MiddleSchool/Class8').then(m => ({ default: m.FrictionLab })));
const ElectroplatingLab = lazy(() => import('./labs/MiddleSchool/Class8').then(m => ({ default: m.ElectroplatingLab })));
const StaticChargeLab = lazy(() => import('./labs/MiddleSchool/Class8').then(m => ({ default: m.StaticChargeLab })));
const PythonLab = lazy(() => import('./labs/MiddleSchool/Class8').then(m => ({ default: m.PythonLab })));
const PulseLab = lazy(() => import('./labs/MiddleSchool/Class8').then(m => ({ default: m.PulseLab })));

// Class 9
const PhaseChangeLab = lazy(() => import('./labs/Secondary/Class9').then(m => ({ default: m.PhaseChangeLab })));
const MixtureLab = lazy(() => import('./labs/Secondary/Class9').then(m => ({ default: m.MixtureLab })));
const SublimationLab = lazy(() => import('./labs/Secondary/Class9').then(m => ({ default: m.SublimationLab })));
const TissueLab = lazy(() => import('./labs/Secondary/Class9').then(m => ({ default: m.TissueLab })));
const ArchimedesLab = lazy(() => import('./labs/Secondary/Class9').then(m => ({ default: m.ArchimedesLab })));
const SoundReflectionLab = lazy(() => import('./labs/Secondary/Class9').then(m => ({ default: m.SoundReflectionLab })));
const PolynomialLab = lazy(() => import('./labs/Secondary/Class9').then(m => ({ default: m.PolynomialLab })));
const SpreadsheetLab = lazy(() => import('./labs/Secondary/Class9').then(m => ({ default: m.SpreadsheetLab })));

// Class 10
const ExothermicLab = lazy(() => import('./labs/Secondary/Class10').then(m => ({ default: m.ExothermicLab })));
const ReactivityLab = lazy(() => import('./labs/Secondary/Class10').then(m => ({ default: m.ReactivityLab })));
const StomataLab = lazy(() => import('./labs/Secondary/Class10').then(m => ({ default: m.StomataLab })));
const OhmsLawLab = lazy(() => import('./labs/Secondary/Class10').then(m => ({ default: m.OhmsLawLab })));
const ResistorNetworkLab = lazy(() => import('./labs/Secondary/Class10').then(m => ({ default: m.ResistorNetworkLab })));
const FocalLengthLab = lazy(() => import('./labs/Secondary/Class10').then(m => ({ default: m.FocalLengthLab })));
const RefractionLab = lazy(() => import('./labs/Secondary/Class10').then(m => ({ default: m.RefractionLab })));
const TangentsLab = lazy(() => import('./labs/Secondary/Class10').then(m => ({ default: m.TangentsLab })));

// Senior Secondary
const PendulumLab = lazy(() => import('./labs/SeniorSecondary/HighSchool').then(m => ({ default: m.PendulumLab })));
const PhScaleLab = lazy(() => import('./labs/SeniorSecondary/HighSchool').then(m => ({ default: m.PhScaleLab })));
const CellExplorerLab = lazy(() => import('./labs/SeniorSecondary/HighSchool').then(m => ({ default: m.CellExplorerLab })));

// Class 11
const VernierLab = lazy(() => import('./labs/SeniorSecondary/Class11').then(m => ({ default: m.VernierLab })));
const ScrewGaugeLab = lazy(() => import('./labs/SeniorSecondary/Class11').then(m => ({ default: m.ScrewGaugeLab })));
const PendulumAdvancedLab = lazy(() => import('./labs/SeniorSecondary/Class11').then(m => ({ default: m.PendulumAdvancedLab })));
const TitrationLab = lazy(() => import('./labs/SeniorSecondary/Class11').then(m => ({ default: m.TitrationLab })));
const EquilibriumLab = lazy(() => import('./labs/SeniorSecondary/Class11').then(m => ({ default: m.EquilibriumLab })));
const OsmosisLab = lazy(() => import('./labs/SeniorSecondary/Class11').then(m => ({ default: m.OsmosisLab })));
const PythonMathLab = lazy(() => import('./labs/SeniorSecondary/Class11').then(m => ({ default: m.PythonMathLab })));
const ArmstrongLab = lazy(() => import('./labs/SeniorSecondary/Class11').then(m => ({ default: m.ArmstrongLab })));

// Class 12
const MetreBridgeLab = lazy(() => import('./labs/SeniorSecondary/Class12').then(m => ({ default: m.MetreBridgeLab })));
const PotentiometerLab = lazy(() => import('./labs/SeniorSecondary/Class12').then(m => ({ default: m.PotentiometerLab })));
const PNJunctionLab = lazy(() => import('./labs/SeniorSecondary/Class12').then(m => ({ default: m.PNJunctionLab })));
const TitrationKMnO4Lab = lazy(() => import('./labs/SeniorSecondary/Class12').then(m => ({ default: m.TitrationKMnO4Lab })));
const FunctionalGroupLab = lazy(() => import('./labs/SeniorSecondary/Class12').then(m => ({ default: m.FunctionalGroupLab })));
const DNAIsolationLab = lazy(() => import('./labs/SeniorSecondary/Class12').then(m => ({ default: m.DNAIsolationLab })));
const SQLTerminalLab = lazy(() => import('./labs/SeniorSecondary/Class12').then(m => ({ default: m.SQLTerminalLab })));
const PulseAdvancedLab = lazy(() => import('./labs/SeniorSecondary/Class12').then(m => ({ default: m.PulseAdvancedLab })));

// Diploma
const LargestNumberLab = lazy(() => import('./labs/Diploma/Sem1_2').then(m => ({ default: m.LargestNumberLab })));
const KCLLab = lazy(() => import('./labs/Diploma/Sem1_2').then(m => ({ default: m.KCLLab })));
const AndroidSimLab = lazy(() => import('./labs/Diploma/Sem1_2').then(m => ({ default: m.AndroidSimLab })));
const HTMLLab = lazy(() => import('./labs/Diploma/Sem1_2').then(m => ({ default: m.HTMLLab })));

const PythonListLab = lazy(() => import('./labs/Diploma/Sem3_4').then(m => ({ default: m.PythonListLab })));
const LogicGateLab = lazy(() => import('./labs/Diploma/Sem3_4').then(m => ({ default: m.LogicGateLab })));
const SevenSegmentLab = lazy(() => import('./labs/Diploma/Sem3_4').then(m => ({ default: m.SevenSegmentLab })));
const DBMSConstraintLab = lazy(() => import('./labs/Diploma/Sem3_4').then(m => ({ default: m.DBMSConstraintLab })));

const LadderLogicLab = lazy(() => import('./labs/Diploma/Sem5_6').then(m => ({ default: m.LadderLogicLab })));
const BottleFillingLab = lazy(() => import('./labs/Diploma/Sem5_6').then(m => ({ default: m.BottleFillingLab })));
const ProjectSurveyLab = lazy(() => import('./labs/Diploma/Sem5_6').then(m => ({ default: m.ProjectSurveyLab })));
const ProjectSubmissionLab = lazy(() => import('./labs/Diploma/Sem5_6').then(m => ({ default: m.ProjectSubmissionLab })));

// PUC
const ParallelogramLawLab = lazy(() => import('./labs/PUC/PUC1').then(m => ({ default: m.ParallelogramLawLab })));
const CapillaryRiseLab = lazy(() => import('./labs/PUC/PUC1').then(m => ({ default: m.CapillaryRiseLab })));
const CalorimetryLab = lazy(() => import('./labs/PUC/PUC1').then(m => ({ default: m.CalorimetryLab })));
const CProgrammingLab = lazy(() => import('./labs/PUC/PUC1').then(m => ({ default: m.CProgrammingLab })));

const MeterBridgeSpecLab = lazy(() => import('./labs/PUC/PUC2').then(m => ({ default: m.MeterBridgeSpecLab })));
const TransistorLab = lazy(() => import('./labs/PUC/PUC2').then(m => ({ default: m.TransistorLab })));
const DiffractionLab = lazy(() => import('./labs/PUC/PUC2').then(m => ({ default: m.DiffractionLab })));
const CPPLab = lazy(() => import('./labs/PUC/PUC2').then(m => ({ default: m.CPPLab })));

const ViscosityLab = lazy(() => import('./labs/PUC/PUC1').then(m => ({ default: m.ViscosityLab })));
const BoylesLawLab = lazy(() => import('./labs/PUC/PUC1').then(m => ({ default: m.BoylesLawLab })));
const SonometerLab = lazy(() => import('./labs/PUC/PUC1').then(m => ({ default: m.SonometerLab })));
const AnionAnalysisLab = lazy(() => import('./labs/PUC/PUC1').then(m => ({ default: m.AnionAnalysisLab })));

const ZenerDiodeLab = lazy(() => import('./labs/PUC/PUC2').then(m => ({ default: m.ZenerDiodeLab })));
const UniversalGateLab = lazy(() => import('./labs/PUC/PUC2').then(m => ({ default: m.UniversalGateLab })));
const InternalResistanceLab = lazy(() => import('./labs/PUC/PUC2').then(m => ({ default: m.InternalResistanceLab })));
const AspirinSynthesisLab = lazy(() => import('./labs/PUC/PUC2').then(m => ({ default: m.AspirinSynthesisLab })));

// Undergraduate (UG)
const ArithmeticLab = lazy(() => import('./labs/Undergraduate/Sem1_2').then(m => ({ default: m.ArithmeticLab })));
const DecisionLab = lazy(() => import('./labs/Undergraduate/Sem1_2').then(m => ({ default: m.DecisionLab })));
const SeriesLoopLab = lazy(() => import('./labs/Undergraduate/Sem1_2').then(m => ({ default: m.SeriesLoopLab })));

const StackInfixLab = lazy(() => import('./labs/Undergraduate/Sem3_4').then(m => ({ default: m.StackInfixLab })));
const LinkedListLab = lazy(() => import('./labs/Undergraduate/Sem3_4').then(m => ({ default: m.LinkedListLab })));
const DijkstraLab = lazy(() => import('./labs/Undergraduate/Sem3_4').then(m => ({ default: m.DijkstraLab })));

const NetworkSimLab = lazy(() => import('./labs/Undergraduate/Sem5_6').then(m => ({ default: m.NetworkSimLab })));
const SoftwareTestingLab = lazy(() => import('./labs/Undergraduate/Sem5_6').then(m => ({ default: m.SoftwareTestingLab })));
const ReactLifecycleLab = lazy(() => import('./labs/Undergraduate/Sem5_6').then(m => ({ default: m.ReactLifecycleLab })));

const AStarSearchLab = lazy(() => import('./labs/Undergraduate/Sem7_8').then(m => ({ default: m.AStarSearchLab })));
const CloudAllocationLab = lazy(() => import('./labs/Undergraduate/Sem7_8').then(m => ({ default: m.CloudAllocationLab })));
const ProjectArchLab = lazy(() => import('./labs/Undergraduate/Sem7_8').then(m => ({ default: m.ProjectArchLab })));

// Postgraduate (PG)
const BSTLab = lazy(() => import('./labs/Postgraduate/Sem1_2').then(m => ({ default: m.BSTLab })));
const RSALab = lazy(() => import('./labs/Postgraduate/Sem1_2').then(m => ({ default: m.RSALab })));
const SQLPG_Lab = lazy(() => import('./labs/Postgraduate/Sem1_2').then(m => ({ default: m.SQLPG_Lab })));

const DockerLab = lazy(() => import('./labs/Postgraduate/Sem3_4').then(m => ({ default: m.DockerLab })));
const BlockchainLab = lazy(() => import('./labs/Postgraduate/Sem3_4').then(m => ({ default: m.BlockchainLab })));
const ResearchLab = lazy(() => import('./labs/Postgraduate/Sem3_4').then(m => ({ default: m.ResearchLab })));
const DefenseLab = lazy(() => import('./labs/Postgraduate/Sem3_4').then(m => ({ default: m.DefenseLab })));

const CATEGORIES = [
    { id: 'early', name: 'Early School', icon: School, levels: ['1', '2', '3', '4', '5'] },
    { id: 'middle', name: 'Middle School', icon: BookOpen, levels: ['6', '7', '8'] },
    { id: 'secondary', name: 'Secondary', icon: Building2, levels: ['9', '10'] },
    { id: 'senior', name: 'Senior Secondary', icon: GraduationCap, levels: ['11', '12', 'HS'] },
    { id: 'puc', name: 'PUC', icon: Building2, levels: ['PUC1', 'PUC2'] },
    { id: 'diploma', name: 'Diploma', icon: Zap, levels: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'] },
    { id: 'ug', name: 'Undergraduate', icon: GraduationCap, levels: ['UG1', 'UG2', 'UG3', 'UG4', 'UG5', 'UG6', 'UG7', 'UG8'] },
    { id: 'pg', name: 'Postgraduate', icon: Brain, levels: ['PG1', 'PG2', 'PG3', 'PG4'] },
];

const ALL_LABS = [
  // Class 1 (Early School)
  { id: 'shape', title: 'Shape Sorter', class: '1', category: 'early', subject: 'Math', icon: Shapes, color: 'text-red-600 bg-red-50', component: ShapeSorter },
  { id: 'bead', title: 'Bead Counter', class: '1', category: 'early', subject: 'Math', icon: Hash, color: 'text-blue-600 bg-blue-50', component: BeadCounter },
  { id: 'hand', title: 'Hand-span Measure', class: '1', category: 'early', subject: 'Math', icon: Ruler, color: 'text-amber-600 bg-amber-50', component: HandSpanMeasure },
  // Class 2
  { id: 'roll', title: 'Roll and Slide', class: '2', category: 'early', subject: 'Math', icon: MoveRight, color: 'text-indigo-600 bg-indigo-50', component: RollSlideTest },
  { id: 'jar', title: 'Jar Estimator', class: '2', category: 'early', subject: 'Math', icon: HelpCircle, color: 'text-purple-600 bg-purple-50', component: JarEstimator },
  { id: 'scale', title: 'Balance Scale', class: '2', category: 'early', subject: 'Math', icon: Scale, color: 'text-gray-600 bg-gray-50', component: BalanceScale },
  { id: 'trace', title: 'Outline Tracer', class: '2', category: 'early', subject: 'Math', icon: PenTool, color: 'text-blue-600 bg-blue-50', component: OutlineTracer },
  // Class 3
  { id: 'animal', title: 'Animal Classify', class: '3', category: 'early', subject: 'EVS', icon: Bird, color: 'text-green-600 bg-green-50', component: AnimalClassifier },
  { id: 'solub', title: 'Water Solubility', class: '3', category: 'early', subject: 'EVS', icon: Droplets, color: 'text-blue-600 bg-blue-50', component: WaterSolubility },
  { id: 'leaf', title: 'Leaf Texture', class: '3', category: 'early', subject: 'EVS', icon: Leaf, color: 'text-emerald-600 bg-emerald-50', component: LeafTexture },
  { id: 'utensil', title: 'Utensil Matcher', class: '3', category: 'early', subject: 'EVS', icon: Utensils, color: 'text-orange-600 bg-orange-50', component: UtensilMatcher },
  { id: 'token', title: 'Token Math', class: '3', category: 'early', subject: 'Math', icon: Coins, color: 'text-yellow-600 bg-yellow-50', component: TokenMath },
  { id: 'share', title: 'Bead Sharer', class: '3', category: 'early', subject: 'Math', icon: Users, color: 'text-purple-600 bg-purple-50', component: BeadSharer },
  { id: 'paint', title: 'Mini Paint', class: '3', category: 'early', subject: 'Comp', icon: Paintbrush, color: 'text-pink-600 bg-pink-50', component: MiniPaint },
  // Class 4
  { id: 'food', title: 'Food Mapper', class: '4', category: 'early', subject: 'EVS', icon: Apple, color: 'text-red-600 bg-red-50', component: FoodMapper },
  { id: 'fresh', title: 'Freshness Test', class: '4', category: 'early', subject: 'EVS', icon: Carrot, color: 'text-orange-600 bg-orange-50', component: FreshnessTest },
  { id: 'house', title: 'House Builder', class: '4', category: 'early', subject: 'EVS', icon: Home, color: 'text-amber-800 bg-amber-50', component: HouseBuilder },
  { id: 'spice', title: 'Spice Riddle', class: '4', category: 'early', subject: 'EVS', icon: Flame, color: 'text-red-700 bg-red-50', component: SpiceRiddle },
  { id: 'table', title: 'Matchstick Tables', class: '4', category: 'early', subject: 'Math', icon: Table, color: 'text-blue-700 bg-blue-50', component: MatchstickTables },
  { id: 'fraction', title: 'Fraction Folder', class: '4', category: 'early', subject: 'Math', icon: FileJson, color: 'text-indigo-700 bg-indigo-50', component: FractionFolder },

  // Class 5 (Early School)
  { id: 'ants', title: 'Sense of Smell', class: '5', category: 'early', subject: 'EVS', icon: Compass, color: 'text-amber-600 bg-amber-50', component: AntSenseLab },
  { id: 'germinate', title: 'Seed Growth', class: '5', category: 'early', subject: 'EVS', icon: Leaf, color: 'text-green-600 bg-green-50', component: GerminationLab },
  { id: 'float', title: 'Sink or Float', class: '5', category: 'early', subject: 'EVS', icon: Droplets, color: 'text-blue-500 bg-blue-50', component: FloatationLab },
  { id: 'angle', title: 'Angle Tester', class: '5', category: 'early', subject: 'Math', icon: Shapes, color: 'text-amber-800 bg-amber-50', component: AngleTester },
  { id: 'top', title: 'Magic Top', class: '5', category: 'early', subject: 'Math', icon: Sparkles, color: 'text-indigo-600 bg-indigo-50', component: MagicTop },
  { id: 'scratch', title: 'Scratch Basics', class: '5', category: 'early', subject: 'Comp', icon: Play, color: 'text-orange-600 bg-orange-50', component: ScratchBasics },
  { id: 'map', title: 'Map Pointing', class: '5', category: 'early', subject: 'EVS', icon: MapPin, color: 'text-red-500 bg-red-50', component: MapPointing },
  { id: 'flow', title: 'Flowchart Logic', class: '5', category: 'early', subject: 'Comp', icon: Network, color: 'text-gray-600 bg-gray-50', component: FlowchartLab },

  // Middle School (Class 6)
  { id: 'starch', title: 'Starch Test', class: '6', category: 'middle', subject: 'Science', icon: Droplets, color: 'text-blue-600 bg-blue-50', component: StarchTest },
  { id: 'protein', title: 'Protein Test', class: '6', category: 'middle', subject: 'Science', icon: Droplets, color: 'text-purple-600 bg-purple-50', component: ProteinTest },
  { id: 'fats', title: 'Fats Test', class: '6', category: 'middle', subject: 'Science', icon: Eye, color: 'text-yellow-600 bg-yellow-50', component: FatsTest },
  { id: 'solubility', title: 'Solubility Test', class: '6', category: 'middle', subject: 'Science', icon: Droplets, color: 'text-cyan-600 bg-cyan-50', component: SolubilityTest },
  { id: 'transparency', title: 'Transparency Test', class: '6', category: 'middle', subject: 'Science', icon: Eye, color: 'text-gray-600 bg-gray-50', component: TransparencyTest },
  { id: 'filtration', title: 'Filtration Lab', class: '6', category: 'middle', subject: 'Science', icon: Filter, color: 'text-blue-700 bg-blue-50', component: FiltrationLab },
  { id: 'evaporation', title: 'Evaporation Lab', class: '6', category: 'middle', subject: 'Science', icon: Flame, color: 'text-red-600 bg-red-50', component: EvaporationLab },
  { id: 'transpiration', title: 'Transpiration Lab', class: '6', category: 'middle', subject: 'Science', icon: Wind, color: 'text-green-600 bg-green-50', component: TranspirationLab },
  { id: 'roots', title: 'Root Systems', class: '6', category: 'middle', subject: 'Science', icon: Network, color: 'text-amber-700 bg-amber-50', component: RootSystems },
  { id: 'circuit', title: 'Simple Circuit', class: '6', category: 'middle', subject: 'Science', icon: Zap, color: 'text-yellow-500 bg-yellow-50', component: SimpleCircuit },

  // Class 7 (Middle School)
  { id: 'photosynth', title: 'Photosynthesis', class: '7', category: 'middle', subject: 'Science', icon: Sun, color: 'text-green-600 bg-green-50', component: PhotosynthesisLab },
  { id: 'thermometer', title: 'Thermometer', class: '7', category: 'middle', subject: 'Science', icon: Thermometer, color: 'text-red-600 bg-red-50', component: ThermometerLab },
  { id: 'conduction', title: 'Heat Conduction', class: '7', category: 'middle', subject: 'Science', icon: Flame, color: 'text-orange-600 bg-orange-50', component: ConductionLab },
  { id: 'litmus', title: 'Litmus Test', class: '7', category: 'middle', subject: 'Science', icon: Droplets, color: 'text-blue-600 bg-blue-50', component: LitmusLab },
  { id: 'turmeric', title: 'Turmeric Indicator', class: '7', category: 'middle', subject: 'Science', icon: Droplets, color: 'text-yellow-600 bg-yellow-50', component: TurmericLab },
  { id: 'magnesium', title: 'Magnesium Ribbon', class: '7', category: 'middle', subject: 'Science', icon: Flame, color: 'text-gray-600 bg-gray-50', component: MagnesiumLab },
  { id: 'chemchange', title: 'Chemical Change', class: '7', category: 'middle', subject: 'Science', icon: Droplets, color: 'text-green-700 bg-green-50', component: ChemicalChangeLab },
  { id: 'electromag', title: 'Electromagnet', class: '7', category: 'middle', subject: 'Science', icon: Zap, color: 'text-indigo-600 bg-indigo-50', component: ElectromagnetLab },
  { id: 'newton', title: 'Newton Disc', class: '7', category: 'middle', subject: 'Science', icon: Sparkles, color: 'text-purple-600 bg-purple-50', component: NewtonDiscLab },

  // Class 8 (Middle School)
  { id: 'mould', title: 'Bread Mould', class: '8', category: 'middle', subject: 'Science', icon: Eye, color: 'text-green-800 bg-green-50', component: BreadMouldLab },
  { id: 'combustion', title: 'Combustion Test', class: '8', category: 'middle', subject: 'Science', icon: Flame, color: 'text-red-700 bg-red-50', component: CombustionLab },
  { id: 'candle', title: 'Candle Zones', class: '8', category: 'middle', subject: 'Science', icon: Flame, color: 'text-orange-500 bg-orange-50', component: CandleZonesLab },
  { id: 'pressure', title: 'Liquid Pressure', class: '8', category: 'middle', subject: 'Science', icon: Droplets, color: 'text-blue-700 bg-blue-50', component: PressureLab },
  { id: 'friction', title: 'Friction Lab', class: '8', category: 'middle', subject: 'Science', icon: Box, color: 'text-gray-700 bg-gray-50', component: FrictionLab },
  { id: 'plating', title: 'Electroplating', class: '8', category: 'middle', subject: 'Science', icon: Zap, color: 'text-amber-600 bg-amber-50', component: ElectroplatingLab },
  { id: 'static', title: 'Static Charge', class: '8', category: 'middle', subject: 'Science', icon: Zap, color: 'text-blue-500 bg-blue-50', component: StaticChargeLab },
  { id: 'python', title: 'Python Interest', class: '8', category: 'middle', subject: 'Comp', icon: Play, color: 'text-gray-900 bg-gray-100', component: PythonLab },
  { id: 'pulse', title: 'Pulse Rate', class: '8', category: 'middle', subject: 'Biology', icon: Activity, color: 'text-red-500 bg-red-50', component: PulseLab },

  // Class 9 (Secondary)
  { id: 'phase', title: 'Phase Change', class: '9', category: 'secondary', subject: 'Science', icon: Thermometer, color: 'text-red-600 bg-red-50', component: PhaseChangeLab },
  { id: 'mixtures', title: 'Mixtures Type', class: '9', category: 'secondary', subject: 'Science', icon: Droplets, color: 'text-blue-600 bg-blue-50', component: MixtureLab },
  { id: 'sublimation', title: 'Sublimation', class: '9', category: 'secondary', subject: 'Science', icon: Flame, color: 'text-purple-600 bg-purple-50', component: SublimationLab },
  { id: 'tissues', title: 'Plant Tissues', class: '9', category: 'secondary', subject: 'Science', icon: Search, color: 'text-green-600 bg-green-50', component: TissueLab },
  { id: 'archimedes', title: 'Archimedes Law', class: '9', category: 'secondary', subject: 'Science', icon: Box, color: 'text-blue-700 bg-blue-50', component: ArchimedesLab },
  { id: 'soundrefl', title: 'Sound Refl.', class: '9', category: 'secondary', subject: 'Science', icon: Wind, color: 'text-gray-600 bg-gray-50', component: SoundReflectionLab },
  { id: 'polyzero', title: 'Poly Zeroes', class: '9', category: 'secondary', subject: 'Math', icon: Activity, color: 'text-indigo-600 bg-indigo-50', component: PolynomialLab },
  { id: 'sheet', title: 'Spreadsheet', class: '9', category: 'secondary', subject: 'Comp', icon: Table, color: 'text-green-700 bg-green-50', component: SpreadsheetLab },

  // Class 10 (Secondary)
  { id: 'exothermic', title: 'Exothermic Rxn', class: '10', category: 'secondary', subject: 'Science', icon: Flame, color: 'text-orange-600 bg-orange-50', component: ExothermicLab },
  { id: 'reactivity', title: 'Reactivity Ser.', class: '10', category: 'secondary', subject: 'Science', icon: Droplets, color: 'text-blue-600 bg-blue-50', component: ReactivityLab },
  { id: 'stomata', title: 'Stomata View', class: '10', category: 'secondary', subject: 'Science', icon: Search, color: 'text-green-600 bg-green-50', component: StomataLab },
  { id: 'ohmslaw', title: 'Ohm Law', class: '10', category: 'secondary', subject: 'Science', icon: Zap, color: 'text-indigo-600 bg-indigo-50', component: OhmsLawLab },
  { id: 'resistors', title: 'Resistor Net.', class: '10', category: 'secondary', subject: 'Science', icon: Network, color: 'text-blue-700 bg-blue-50', component: ResistorNetworkLab },
  { id: 'focal', title: 'Focal Length', class: '10', category: 'secondary', subject: 'Science', icon: Eye, color: 'text-orange-500 bg-orange-50', component: FocalLengthLab },
  { id: 'refraction', title: 'Refraction Lab', class: '10', category: 'secondary', subject: 'Science', icon: MoveRight, color: 'text-red-500 bg-red-50', component: RefractionLab },
  { id: 'tangents', title: 'Tangent Circle', class: '10', category: 'secondary', subject: 'Math', icon: Activity, color: 'text-blue-800 bg-blue-50', component: TangentsLab },
  // Senior Secondary
  { id: 'pendulum', title: 'Simple Pendulum', class: 'HS', category: 'senior', subject: 'Physics', icon: Atom, color: 'text-indigo-600 bg-indigo-50', component: PendulumLab },
  { id: 'ph', title: 'pH Scale Explorer', class: 'HS', category: 'senior', subject: 'Chemistry', icon: Beaker, color: 'text-emerald-600 bg-emerald-50', component: PhScaleLab },
  { id: 'cell', title: 'Cell Structure', class: 'HS', category: 'senior', subject: 'Biology', icon: Leaf, color: 'text-pink-600 bg-pink-50', component: CellExplorerLab },

  // Class 11 (Senior Secondary)
  { id: 'vernier', title: 'Vernier Calliper', class: '11', category: 'senior', subject: 'Physics', icon: Ruler, color: 'text-indigo-600 bg-indigo-50', component: VernierLab },
  { id: 'screw', title: 'Screw Gauge', class: '11', category: 'senior', subject: 'Physics', icon: Ruler, color: 'text-gray-600 bg-gray-50', component: ScrewGaugeLab },
  { id: 'pendadv', title: 'Pendulum Adv.', class: '11', category: 'senior', subject: 'Physics', icon: Activity, color: 'text-red-500 bg-red-50', component: PendulumAdvancedLab },
  { id: 'titration1', title: 'NaOH Titration', class: '11', category: 'senior', subject: 'Chemistry', icon: Beaker, color: 'text-blue-600 bg-blue-50', component: TitrationLab },
  { id: 'equilibrium', title: 'Equilibrium', class: '11', category: 'senior', subject: 'Chemistry', icon: Droplets, color: 'text-red-800 bg-red-50', component: EquilibriumLab },
  { id: 'osmosis', title: 'Osmosis Lab', class: '11', category: 'senior', subject: 'Biology', icon: Droplets, color: 'text-green-600 bg-green-50', component: OsmosisLab },
  { id: 'pymath', title: 'Python n+nn...', class: '11', category: 'senior', subject: 'Comp', icon: Play, color: 'text-gray-900 bg-gray-100', component: PythonMathLab },
  { id: 'armstrong', title: 'Armstrong Check', class: '11', category: 'senior', subject: 'Comp', icon: Play, color: 'text-green-700 bg-green-50', component: ArmstrongLab },

  // Class 12 (Senior Secondary)
  { id: 'bridge', title: 'Metre Bridge', class: '12', category: 'senior', subject: 'Physics', icon: Zap, color: 'text-amber-700 bg-amber-50', component: MetreBridgeLab },
  { id: 'potentiometer', title: 'Potentiometer', class: '12', category: 'senior', subject: 'Physics', icon: Zap, color: 'text-indigo-600 bg-indigo-50', component: PotentiometerLab },
  { id: 'pnjunction', title: 'P-N Junction', class: '12', category: 'senior', subject: 'Physics', icon: Activity, color: 'text-red-600 bg-red-50', component: PNJunctionLab },
  { id: 'kmno4', title: 'KMnO4 Titration', class: '12', category: 'senior', subject: 'Chemistry', icon: Beaker, color: 'text-purple-600 bg-purple-50', component: TitrationKMnO4Lab },
  { id: 'groups', title: 'Functional Grps', class: '12', category: 'senior', subject: 'Chemistry', icon: Droplets, color: 'text-blue-700 bg-blue-50', component: FunctionalGroupLab },
  { id: 'dna', title: 'DNA Isolation', class: '12', category: 'senior', subject: 'Biology', icon: Search, color: 'text-green-600 bg-green-50', component: DNAIsolationLab },
  { id: 'sql', title: 'SQL Terminal', class: '12', category: 'senior', subject: 'Comp', icon: Play, color: 'text-gray-900 bg-gray-100', component: SQLTerminalLab },
  { id: 'pulseadv', title: 'Pulse (Exercise)', class: '12', category: 'senior', subject: 'Biology', icon: Activity, color: 'text-red-500 bg-red-50', component: PulseAdvancedLab },

  // Diploma (Polytechnic)
  { id: 'largest', title: 'Largest of 3', class: 'S1', category: 'diploma', subject: 'IT', icon: FileCode, color: 'text-green-600 bg-green-50', component: LargestNumberLab },
  { id: 'kcl', title: 'Kirchhoff Law', class: 'S1', category: 'diploma', subject: 'EE', icon: Zap, color: 'text-yellow-600 bg-yellow-50', component: KCLLab },
  { id: 'android', title: 'Android UI', class: 'S2', category: 'diploma', subject: 'IT', icon: Smartphone, color: 'text-blue-600 bg-blue-50', component: AndroidSimLab },
  { id: 'htmlcss', title: 'Web Format', class: 'S2', category: 'diploma', subject: 'IT', icon: Layout, color: 'text-indigo-600 bg-indigo-50', component: HTMLLab },
  { id: 'pylist', title: 'Python Lists', class: 'S3', category: 'diploma', subject: 'CS', icon: Play, color: 'text-green-700 bg-green-50', component: PythonListLab },
  { id: 'logicgate', title: 'Truth Tables', class: 'S3', category: 'diploma', subject: 'EC', icon: Network, color: 'text-red-600 bg-red-50', component: LogicGateLab },
  { id: '7segment', title: '7-Segment Disp', class: 'S4', category: 'diploma', subject: 'EC', icon: Cpu, color: 'text-red-800 bg-red-50', component: SevenSegmentLab },
  { id: 'dbmsddl', title: 'DBMS DDL', class: 'S4', category: 'diploma', subject: 'CS', icon: Database, color: 'text-blue-800 bg-blue-50', component: DBMSConstraintLab },
  { id: 'ladder', title: 'Ladder Logic', class: 'S5', category: 'diploma', subject: 'ME', icon: Network, color: 'text-gray-700 bg-gray-50', component: LadderLogicLab },
  { id: 'bottle', title: 'Automation', class: 'S5', category: 'diploma', subject: 'ME', icon: Box, color: 'text-blue-500 bg-blue-50', component: BottleFillingLab },
  { id: 'survey', title: 'Lit Survey', class: 'S6', category: 'diploma', subject: 'Gen', icon: Search, color: 'text-indigo-800 bg-indigo-50', component: ProjectSurveyLab },
  { id: 'grad', title: 'Final Submit', class: 'S6', category: 'diploma', subject: 'Gen', icon: FileCode, color: 'text-green-800 bg-green-50', component: ProjectSubmissionLab },

  // PUC (Pre-University)
  { id: 'vectors', title: 'Vector Law', class: 'PUC1', category: 'puc', subject: 'Physics', icon: Scale, color: 'text-rose-600 bg-rose-50', component: ParallelogramLawLab },
  { id: 'caprise', title: 'Capillary Rise', class: 'PUC1', category: 'puc', subject: 'Physics', icon: Droplets, color: 'text-blue-600 bg-blue-50', component: CapillaryRiseLab },
  { id: 'calorimetry', title: 'Calorimetry', class: 'PUC1', category: 'puc', subject: 'Physics', icon: Thermometer, color: 'text-amber-600 bg-amber-50', component: CalorimetryLab },
  { id: 'cprog', title: 'C-Prog SI', class: 'PUC1', category: 'puc', subject: 'CS', icon: Play, color: 'text-gray-900 bg-gray-100', component: CProgrammingLab },
  { id: 'viscosity', title: 'Viscosity', class: 'PUC1', category: 'puc', subject: 'Physics', icon: Droplets, color: 'text-amber-600 bg-amber-50', component: ViscosityLab },
  { id: 'boyle', title: 'Boyles Law', class: 'PUC1', category: 'puc', subject: 'Physics', icon: Activity, color: 'text-blue-600 bg-blue-50', component: BoylesLawLab },
  { id: 'sonometer', title: 'Sonometer', class: 'PUC1', category: 'puc', subject: 'Physics', icon: Zap, color: 'text-amber-800 bg-amber-50', component: SonometerLab },
  { id: 'anion', title: 'Anion Test', class: 'PUC1', category: 'puc', subject: 'Chem', icon: Search, color: 'text-indigo-600 bg-indigo-50', component: AnionAnalysisLab },
  
  { id: 'specres', title: 'Spec. Resistance', class: 'PUC2', category: 'puc', subject: 'Physics', icon: Zap, color: 'text-amber-800 bg-amber-50', component: MeterBridgeSpecLab },
  { id: 'transistor', title: 'Transistor CE', class: 'PUC2', category: 'puc', subject: 'EC', icon: Activity, color: 'text-green-600 bg-green-50', component: TransistorLab },
  { id: 'diffraction', title: 'Diffraction', class: 'PUC2', category: 'puc', subject: 'Physics', icon: Eye, color: 'text-red-600 bg-red-50', component: DiffractionLab },
  { id: 'cppoop', title: 'C++ OOP', class: 'PUC2', category: 'puc', subject: 'CS', icon: Play, color: 'text-blue-700 bg-blue-50', component: CPPLab },
  { id: 'zener', title: 'Zener Diode', class: 'PUC2', category: 'puc', subject: 'EC', icon: Zap, color: 'text-indigo-600 bg-indigo-50', component: ZenerDiodeLab },
  { id: 'nand', title: 'Universal NAND', class: 'PUC2', category: 'puc', subject: 'EC', icon: Network, color: 'text-gray-900 bg-gray-50', component: UniversalGateLab },
  { id: 'intres', title: 'Int. Resistance', class: 'PUC2', category: 'puc', subject: 'Physics', icon: Scale, color: 'text-rose-600 bg-rose-50', component: InternalResistanceLab },
  { id: 'aspirin', title: 'Aspirin Prep', class: 'PUC2', category: 'puc', subject: 'Chem', icon: Box, color: 'text-indigo-400 bg-indigo-50', component: AspirinSynthesisLab },

  // Undergraduate (UG)
  { id: 'arithug', title: '[22POPL13] Arithmetic', class: 'UG1', category: 'ug', subject: 'CS', icon: Code2, color: 'text-green-600 bg-green-50', component: ArithmeticLab },
  { id: 'switchug', title: '[22POPL13] Decision', class: 'UG1', category: 'ug', subject: 'CS', icon: Terminal, color: 'text-blue-600 bg-blue-50', component: DecisionLab },
  { id: 'loopug', title: '[22POPL13] Series Loop', class: 'UG2', category: 'ug', subject: 'CS', icon: RotateCcw, color: 'text-amber-600 bg-amber-50', component: SeriesLoopLab },
  { id: 'stackug', title: '[21CSL35] Stack Ops', class: 'UG3', category: 'ug', subject: 'DS', icon: Layers, color: 'text-indigo-600 bg-indigo-50', component: StackInfixLab },
  { id: 'listug', title: '[21CSL35] Linked List', class: 'UG3', category: 'ug', subject: 'DS', icon: Network, color: 'text-gray-900 bg-gray-50', component: LinkedListLab },
  { id: 'dijkstraug', title: '[21CSL45] Dijkstra', class: 'UG4', category: 'ug', subject: 'ADA', icon: Zap, color: 'text-green-600 bg-green-50', component: DijkstraLab },
  { id: 'netug', title: '[21CSL55] P2P Network', class: 'UG5', category: 'ug', subject: 'CN', icon: Globe, color: 'text-blue-700 bg-blue-50', component: NetworkSimLab },
  { id: 'testug', title: '[21CSL65] Testing', class: 'UG6', category: 'ug', subject: 'ST', icon: CheckCircle2, color: 'text-red-600 bg-red-50', component: SoftwareTestingLab },
  { id: 'reactug', title: '[Web] React Lifecycle', class: 'UG6', category: 'ug', subject: 'Web', icon: Play, color: 'text-blue-500 bg-blue-50', component: ReactLifecycleLab },
  { id: 'astarug', title: '[AI] A* Search', class: 'UG7', category: 'ug', subject: 'AI', icon: Brain, color: 'text-indigo-800 bg-indigo-50', component: AStarSearchLab },
  { id: 'cloudug', title: '[Cloud] Allocation', class: 'UG7', category: 'ug', subject: 'Cloud', icon: Cloud, color: 'text-blue-400 bg-blue-50', component: CloudAllocationLab },
  { id: 'archug', title: '[Project] Arch Designer', class: 'UG8', category: 'ug', subject: 'Project', icon: Rocket, color: 'text-gray-700 bg-gray-50', component: ProjectArchLab },

  // Postgraduate (PG)
  { id: 'bstpg', title: '[22MCA16] BST Traversal', class: 'PG1', category: 'pg', subject: 'DS', icon: Network, color: 'text-indigo-600 bg-indigo-50', component: BSTLab },
  { id: 'rsapg', title: '[Security] RSA Encrypt', class: 'PG1', category: 'pg', subject: 'Sec', icon: Shield, color: 'text-rose-600 bg-rose-50', component: RSALab },
  { id: 'sqlpg', title: '[22MCA26] SQL Joins', class: 'PG2', category: 'pg', subject: 'DB', icon: Database, color: 'text-blue-600 bg-blue-50', component: SQLPG_Lab },
  { id: 'dockerpg', title: '[Cloud] Docker Containers', class: 'PG3', category: 'pg', subject: 'Ops', icon: Box, color: 'text-blue-500 bg-blue-50', component: DockerLab },
  { id: 'blockchainpg', title: '[Security] Blockchain', class: 'PG3', category: 'pg', subject: 'Sec', icon: Layers, color: 'text-indigo-800 bg-indigo-50', component: BlockchainLab },
  { id: 'researchpg', title: '[Research] Paper Draft', class: 'PG4', category: 'pg', subject: 'Gen', icon: FileText, color: 'text-gray-600 bg-gray-50', component: ResearchLab },
  { id: 'gradpg', title: '[Final] Thesis Defense', class: 'PG4', category: 'pg', subject: 'Gen', icon: Rocket, color: 'text-green-600 bg-green-50', component: DefenseLab },
];

const VirtualLabs = ({ theme, student }) => {
  const [activeLabId, setActiveLabId] = useState(null);
  const [activeCategory, setActiveCategory] = useState('early');
  const [search, setSearch] = useState('');
  
  // AI State
  const [aiExplanation, setAiExplanation] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const primaryColor = theme?.primary || '#2E5843';

  const explainExperiment = async (lab) => {
    if (!IS_AI_ENABLED) return;
    setAiLoading(true);
    setAiExplanation(null);
    try {
      const targetLang = LANGUAGES.find(l => l.code === (student?.preferredLanguage || 'en'))?.name || 'English';
      
      const systemInstruction = `You are an expert Virtual Lab assistant. 
RULES:
1. Explain the scientific concepts behind the experiment clearly.
2. Adapt the explanation for a student in Class ${lab.class}.
3. Break down the explanation into: Aim, Principle, and Real-world Application.
4. Use the requested language: ${targetLang}.
5. Return ONLY the explanation text, formatted with clean bullet points.`;

      const prompt = `Explain the experiment: "${lab.title}" for Class ${lab.class}. The subject is ${lab.subject}. Focus on why it matters and how the simulation helps understand it.`;

      const response = await axios.post(`${API_URL}/api/ai/generate`, {
        prompt,
        systemInstruction
      });

      if (response.data?.text) {
        setAiExplanation(response.data.text);
      }
    } catch (err) {
      console.error("AI Explanation error:", err);
      setAiExplanation("Sorry, I couldn't generate an explanation right now.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    if (!aiExplanation) return;

    const utterance = new SpeechSynthesisUtterance(aiExplanation);
    const langMap = {
      'hi': 'hi-IN', 'ta': 'ta-IN', 'te': 'te-IN', 'kn': 'kn-IN',
      'ml': 'ml-IN', 'bn': 'bn-IN', 'mr': 'mr-IN', 'gu': 'gu-IN',
      'pa': 'pa-IN', 'or': 'or-IN', 'as': 'as-IN', 'ur': 'ur-IN', 'en': 'en-IN'
    };
    utterance.lang = langMap[student?.preferredLanguage || 'en'] || 'en-IN';
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const filteredLabs = ALL_LABS.filter(lab => {
    const matchesCategory = lab.category === activeCategory;
    const matchesSearch = lab.title.toLowerCase().includes(search.toLowerCase()) || lab.subject.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (activeLabId) {
    const lab = ALL_LABS.find(l => l.id === activeLabId);
    const LabComponent = lab.component;
    return (
      <div className="animate-in fade-in duration-500 pb-10">
        <button onClick={() => setActiveLabId(null)} className="mb-5 flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Catalog
        </button>
        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm min-h-[500px] flex flex-col">
            <div className="mb-8 border-b border-gray-50 pb-6 flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${lab.color}`}>CLASS {lab.class}</span>
                        <span className="text-[10px] font-black px-2 py-0.5 bg-gray-50 text-gray-500 rounded-md uppercase">{lab.subject}</span>
                    </div>
                    <h2 className="text-2xl font-black text-gray-800">{lab.title}</h2>
                </div>
                <div className={`p-3 rounded-2xl ${lab.color} shadow-sm`}>
                    <lab.icon size={24} />
                </div>
            </div>
            
            <div className="flex-1 flex flex-col items-center">
                <Suspense fallback={<div className="flex flex-col items-center gap-3"><Loader2 className="animate-spin text-blue-600" /> <p className="text-xs font-bold text-gray-400">Loading Experiment...</p></div>}>
                    <div className="w-full max-w-2xl">
                        <LabComponent theme={theme} />
                    </div>
                </Suspense>

                {/* AI Explanation Toggle */}
                <div className="mt-12 w-full max-w-3xl border-t border-gray-100 pt-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                                <Sparkles size={20} />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-gray-800 uppercase tracking-tight">AI Lab Assistant</h4>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Understand the core concepts</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => explainExperiment(lab)}
                            disabled={aiLoading || !IS_AI_ENABLED}
                            className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all disabled:opacity-50"
                        >
                            {aiLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                            {aiExplanation ? "Refresh Explanation" : "Explain with AI"}
                        </button>
                    </div>

                    {aiLoading && (
                        <div className="p-8 bg-gray-50 rounded-3xl border border-gray-100 flex flex-col items-center gap-3 animate-pulse">
                            <Loader2 size={24} className="animate-spin text-indigo-600" />
                            <p className="text-xs font-bold text-gray-400">Consulting AI experts...</p>
                        </div>
                    )}

                    {aiExplanation && (
                        <div className="bg-white rounded-3xl border border-indigo-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
                            <div className="px-6 py-4 bg-indigo-50/50 border-b border-indigo-50 flex items-center justify-between">
                                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                                    <Info size={12} /> Key Learning Points
                                </span>
                                <button 
                                    onClick={handleSpeak}
                                    className={`p-2 rounded-lg transition-colors ${isSpeaking ? 'bg-indigo-600 text-white' : 'text-indigo-400 hover:bg-indigo-100'}`}
                                >
                                    {isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
                                </button>
                            </div>
                            <div className="p-6 md:p-8">
                                <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed font-medium">
                                    <ReactMarkdown>{aiExplanation}</ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 pb-10">
      <div className="mb-10">
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
              <FlaskConical className="w-5 h-5 text-white" />
            </div>
            Virtual Laboratory Hub
          </h2>
          <p className="text-sm text-gray-500 mt-1">Hierarchical curriculum-aligned interactive experiments.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-10">
          {CATEGORIES.map(cat => (
              <button 
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`p-4 rounded-3xl border flex flex-col items-center gap-2 transition-all ${activeCategory === cat.id ? 'bg-white shadow-xl border-blue-100 scale-105' : 'bg-gray-50/50 border-transparent opacity-60 hover:opacity-100 hover:bg-white'}`}
              >
                  <div className={`p-2 rounded-xl ${activeCategory === cat.id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                    <cat.icon size={18} />
                  </div>
                  <span className="text-[9px] font-black uppercase text-center leading-tight">{cat.name}</span>
              </button>
          ))}
      </div>

      <div className="mb-8 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input 
            type="text"
            placeholder={`Search ${CATEGORIES.find(c => c.id === activeCategory)?.name} experiments...`}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 text-sm font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredLabs.map(lab => (
          <div 
            key={lab.id} 
            onClick={() => setActiveLabId(lab.id)} 
            className="group bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex flex-col"
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${lab.color}`}>
              <lab.icon size={28} />
            </div>
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Class {lab.class}</span>
                    <div className="w-1 h-1 rounded-full bg-gray-200"></div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">{lab.subject}</span>
                </div>
                <h3 className="text-lg font-black text-gray-900 leading-tight mb-2 group-hover:text-blue-600 transition-colors">{lab.title}</h3>
                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">Curriculum-aligned experiment for {lab.subject.toLowerCase()} concepts.</p>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Start Experiment</span>
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <ChevronRight size={16} />
                </div>
            </div>
          </div>
        ))}
      </div>

      {filteredLabs.length === 0 && (
          <div className="py-20 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <Search size={32} className="text-gray-200" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">No experiments available yet</h3>
              <p className="text-sm text-gray-500 mt-1">We are actively adding new experiments for this education level.</p>
          </div>
      )}
    </div>
  );
};

export default VirtualLabs;
