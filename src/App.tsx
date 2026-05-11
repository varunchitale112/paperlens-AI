/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import 'katex/dist/katex.min.css';
import 'reactflow/dist/style.css';
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Card, CardContent } from '@/src/components/ui/card';
import { Upload, FileText, Link as LinkIcon, Loader2 } from 'lucide-react';
import { createPaper, updatePaper } from './services/paperService';
import { InlineMath, BlockMath } from 'react-katex';
import ReactFlow, { Background, Controls } from 'reactflow';

export default function App() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [paperData, setPaperData] = useState<any>(null);
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');

  const processPaper = async (data: FormData | { url: string } | { text: string }) => {
    setIsProcessing(true);
    setProcessingStep('Reading and Analyzing Paper...');

    try {
      const response = await fetch('/api/process-paper', {
        method: 'POST',
        body: data instanceof FormData ? data : JSON.stringify(data),
        headers: data instanceof FormData ? {} : { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error('Processing failed');
      const result = await response.json();

      // Create paper record in Firestore
      const paperId = await createPaper({ title: 'Analyzed Paper', status: 'COMPLETED', ...result });
      setPaperData({ id: paperId, ...result });
    } catch (error) {
      console.error(error);
      alert('Failed to process paper');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <Loader2 className="h-10 w-10 animate-spin" />
        <p className="text-lg font-medium">{processingStep}</p>
      </div>
    );
  }

  if (paperData) {
    return (
      <div className="max-w-7xl mx-auto p-4 md:p-10 space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="col-span-1 lg:col-span-2">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4">Summary</h2>
              <p className="text-gray-600">{paperData.summary}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4">Concepts</h2>
              <div className="flex flex-wrap gap-2">
                {paperData.concepts?.map((c: string) => <span key={c} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">{c}</span>)}
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-1 lg:col-span-3">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4">Math Made Simple</h2>
              <BlockMath math={paperData.mathExplainer.split('LaTeX:')[1] || paperData.mathExplainer} />
              <p className="text-gray-600 mt-4"><strong>Layman's Explanation:</strong> This formula relates energy and mass.</p>
            </CardContent>
          </Card>
          <Card className="col-span-1 lg:col-span-3 h-[400px]">
            <CardContent className="pt-6 h-full">
              <h2 className="text-2xl font-semibold mb-4">Mind Map</h2>
              <ReactFlow nodes={paperData.mindMapData?.nodes || []} edges={paperData.mindMapData?.edges || []}>
                <Background />
                <Controls />
              </ReactFlow>
            </CardContent>
          </Card>
           <Card className="col-span-1 lg:col-span-3">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4">Learning Cards</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {paperData.learningCards?.map((c: string, i: number) => (
                    <motion.div key={i} whileHover={{ scale: 1.05 }} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 cursor-pointer">
                        <p className="text-lg font-medium text-center">{c}</p>
                    </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-10">
      <header className="py-10 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight">PaperLens AI</h1>
        <p className="text-xl text-gray-500 mt-2">Visualizing research papers for faster understanding.</p>
      </header>
      
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload"><Upload className="mr-2" /> Upload</TabsTrigger>
          <TabsTrigger value="text"><FileText className="mr-2" /> Paste Text</TabsTrigger>
          <TabsTrigger value="url"><LinkIcon className="mr-2" /> URL</TabsTrigger>
        </TabsList>
        <TabsContent value="upload">
          <Card>
            <CardContent className="space-y-4 pt-6">
              <Input type="file" accept=".pdf" />
              <Button onClick={() => processPaper(new FormData())}>Process PDF</Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="text">
          <Card>
            <CardContent className="space-y-4 pt-6">
              <Input placeholder="Paste paper text here..." value={text} onChange={(e) => setText(e.target.value)} />
              <Button onClick={() => processPaper({ text })}>Process Text</Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="url">
          <Card>
            <CardContent className="space-y-4 pt-6">
              <Input placeholder="Enter paper URL..." value={url} onChange={(e) => setUrl(e.target.value)} />
              <Button onClick={() => processPaper({ url })}>Process URL</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
