"use client";

import * as React from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api, ApiError } from "@/lib/api";
import { formatPercentage, truncate, cn } from "@/lib/utils";
import {
  Upload,
  FileText,
  Search,
  Loader2,
  CheckCircle,
  AlertCircle,
  X,
  Eye,
  Download,
  Sparkles,
} from "lucide-react";

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  resume_text: string;
  experience?: string;
  education?: string;
  match_score: number;
  matched_skills: string[];
  missing_skills: string[];
  created_at: string;
}

export default function ScreeningPage() {
  const [jobTitle, setJobTitle] = React.useState("");
  const [jobDescription, setJobDescription] = React.useState("");
  const [uploadedFiles, setUploadedFiles] = React.useState<File[]>([]);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [results, setResults] = React.useState<Candidate[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [activeStep, setActiveStep] = React.useState(1);
  const [selectedCandidate, setSelectedCandidate] = React.useState<Candidate | null>(null);
  const [jobId, setJobId] = React.useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const pdfFiles = files.filter((f) => f.type === "application/pdf");
    const invalidFiles = files.filter((f) => f.type !== "application/pdf");
    
    if (invalidFiles.length > 0) {
      setError(`${invalidFiles.length} file(s) rejected: Only PDF files are allowed`);
    }
    
    setUploadedFiles((prev) => [...prev, ...pdfFiles]);
    setError(null);
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (!jobTitle.trim()) {
      setError("Job title is required");
      return false;
    }
    if (!jobDescription.trim()) {
      setError("Job description is required");
      return false;
    }
    if (uploadedFiles.length === 0) {
      setError("At least one resume PDF is required");
      return false;
    }
    return true;
  };

  const handleScreening = async () => {
    if (!validateForm()) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      const job = await api.jobs.create({
        title: jobTitle,
        description: jobDescription,
        required_skills: [],
        preferred_skills: [],
      });
      setJobId(job.id);
      
      const result = await api.screening.screen(job.id, uploadedFiles);
      setResults(result.candidates);
      setActiveStep(2);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Screening failed. Please try again.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setJobTitle("");
    setJobDescription("");
    setUploadedFiles([]);
    setResults(null);
    setActiveStep(1);
    setError(null);
    setJobId(null);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600 bg-emerald-100";
    if (score >= 60) return "text-amber-600 bg-amber-100";
    return "text-red-600 bg-red-100";
  };

  const formatMatchScore = (score: number) => `${Math.round(score * 100)}%`;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Resume Screening</h1>
            <p className="text-muted-foreground mt-1">
              Upload resumes and job description to screen candidates with AI-powered matching
            </p>
          </div>
          <Badge variant="outline" className="text-sm">
            <Sparkles className="mr-1.5 h-3 w-3" />
            TF-IDF + Cosine Similarity
          </Badge>
        </div>

        {activeStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>New Screening Job</span>
                <Badge variant="secondary">Step 1 of 2</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <span>{error}</span>
                  <Button variant="ghost" size="sm" onClick={() => setError(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <Label htmlFor="job-title">Job Title</Label>
                  <Input
                    id="job-title"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g., Senior Frontend Engineer"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="job-description">Job Description</Label>
                  <Textarea
                    id="job-description"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the full job description here..."
                    rows={8}
                    className="mt-1 font-mono text-sm"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Resume PDFs</Label>
                  <Badge variant="outline">{uploadedFiles.length} file(s)</Badge>
                </div>
                
                <div
                  className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-emerald-500 transition-colors"
                  onClick={() => document.getElementById("file-upload")?.click()}
                >
                  <input
                    id="file-upload"
                    type="file"
                    accept=".pdf"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">Drag & drop PDF resumes here</p>
                  <p className="text-sm text-muted-foreground mt-1">or click to browse (multiple files supported)</p>
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-blue-500" />
                          <div>
                            <p className="font-medium truncate max-w-xs">{file.name}</p>
                            <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeFile(index)} aria-label="Remove file">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={resetForm} disabled={isProcessing}>
                  Reset
                </Button>
                <Button
                  onClick={handleScreening}
                  disabled={isProcessing || uploadedFiles.length === 0}
                  className="gap-2"
                >
                  <Search className="h-4 w-4" />
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Start Screening"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {activeStep === 2 && results && (
          <>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-6 w-6 text-emerald-500" />
                      Screening Complete
                    </CardTitle>
                    <p className="text-muted-foreground mt-1">
                      Processed {results.length} resumes for "{jobTitle}"
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setActiveStep(1)}>
                      New Screening
                    </Button>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export Results
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Candidate Rankings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rank</TableHead>
                        <TableHead>Candidate</TableHead>
                        <TableHead>Match Score</TableHead>
                        <TableHead>Matched Skills</TableHead>
                        <TableHead>Missing Skills</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.map((candidate, index) => (
                        <TableRow key={candidate.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedCandidate(candidate)}>
                          <TableCell className="font-bold text-lg">{index + 1}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                <span className="text-emerald-600 font-medium">
                                  {candidate.name.split(" ").map(n => n[0]).join("")}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium">{candidate.name}</p>
                                <p className="text-sm text-muted-foreground">{candidate.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className={cn("font-bold px-3 py-1 rounded-full text-sm", getScoreColor(candidate.match_score))}>
                                {formatMatchScore(candidate.match_score)}
                              </span>
                              <Progress value={candidate.match_score * 100} className="h-2 w-32" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {candidate.matched_skills.slice(0, 4).map((skill) => (
                                <Badge key={skill} variant="success" className="text-xs">{skill}</Badge>
                              ))}
                              {candidate.matched_skills.length > 4 && (
                                <Badge variant="outline" className="text-xs">+{candidate.matched_skills.length - 4} more</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {candidate.missing_skills.slice(0, 3).map((skill) => (
                                <Badge key={skill} variant="destructive" className="text-xs">{skill}</Badge>
                              ))}
                              {candidate.missing_skills.length > 3 && (
                                <Badge variant="outline" className="text-xs">+{candidate.missing_skills.length - 3} more</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setSelectedCandidate(candidate); }}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>How Matching Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 font-medium">1</span>
                  <span>Resumes parsed using PyMuPDF to extract text content</span>
                </div>
                <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 font-medium">2</span>
                  <span>Text preprocessed: lowercasing, stopword removal, lemmatization</span>
                </div>
                <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 font-medium">3</span>
                  <span>TF-IDF vectors created for job description and each resume</span>
                </div>
                <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 font-medium">4</span>
                  <span>Cosine similarity computed between job and resume vectors</span>
                </div>
                <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 font-medium">5</span>
                  <span>Skills extracted and matched against required/preferred skills</span>
                </div>
                <p className="text-xs text-muted-foreground/70">
                  Processing powered by FastAPI backend • TF-IDF + Cosine Similarity
                </p>
              </CardContent>
            </Card>
          </>
        )}

        {selectedCandidate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setSelectedCandidate(null)}>
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{selectedCandidate.name}</CardTitle>
                    <p className="text-muted-foreground">{selectedCandidate.email} • {selectedCandidate.phone || 'N/A'}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedCandidate(null)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className={cn("font-bold px-4 py-2 rounded-full text-lg", getScoreColor(selectedCandidate.match_score))}>
                    {formatMatchScore(selectedCandidate.match_score)} Match
                  </span>
                  <Badge variant="outline">{selectedCandidate.experience || 'Not specified'}</Badge>
                  <Badge variant="secondary">{selectedCandidate.education || 'Not specified'}</Badge>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Matched Skills ({selectedCandidate.matched_skills.length})</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCandidate.matched_skills.map((skill) => (
                      <Badge key={skill} variant="success">{skill}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Missing Required Skills ({selectedCandidate.missing_skills.length})</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCandidate.missing_skills.map((skill) => (
                      <Badge key={skill} variant="destructive">{skill}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Resume Excerpt</h4>
                  <p className="text-sm text-muted-foreground p-3 bg-muted rounded-lg font-mono">
                    {truncate(selectedCandidate.resume_text, 500)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}