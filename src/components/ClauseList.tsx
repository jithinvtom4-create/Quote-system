/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Quote, Clause } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Plus, Trash2, Handshake } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { CONFIRM_OPTS } from '../lib/constants';
import { cn } from '../lib/utils';

interface ClauseListProps {
  quote: Quote;
  updateQuote: (updates: Partial<Quote>) => void;
}

export function ClauseList({ quote, updateQuote }: ClauseListProps) {
  const addClause = () => {
    updateQuote({
      clauses: [
        ...quote.clauses,
        {
          id: Math.random().toString(36).substr(2, 9),
          clause: '',
          confirm: 'confirmed',
          remarks: ''
        }
      ]
    });
  };

  const updateClause = (id: string, updates: Partial<Clause>) => {
    updateQuote({
      clauses: quote.clauses.map(c => c.id === id ? { ...c, ...updates } : c)
    });
  };

  const removeClause = (id: string) => {
    updateQuote({
      clauses: quote.clauses.filter(c => c.id !== id)
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-emerald-900">
            <Handshake className="w-4 h-4 text-emerald-600" /> Customer Terms & Our Confirmation
          </CardTitle>
          <Button variant="default" size="xs" onClick={addClause} className="bg-emerald-600 hover:bg-emerald-700 h-7">
            <Plus className="w-3 h-3 mr-1" /> Add Clause
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0 px-0 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-emerald-50/50 hover:bg-emerald-50/50">
              <TableHead className="w-10 text-[11px] font-bold text-emerald-800 text-center">#</TableHead>
              <TableHead className="text-[11px] font-bold text-emerald-800">Customer Clause / Requirement</TableHead>
              <TableHead className="w-44 text-[11px] font-bold text-emerald-800">Our Confirmation</TableHead>
              <TableHead className="text-[11px] font-bold text-emerald-800">Remarks / Details</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quote.clauses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-slate-400 italic text-xs">
                  No clauses added yet. Click "+ Add Clause" to begin.
                </TableCell>
              </TableRow>
            ) : (
              quote.clauses.map((c, idx) => (
                <TableRow key={c.id}>
                  <TableCell className="text-center text-[11px] font-bold text-emerald-900">{idx + 1}</TableCell>
                  <TableCell className="p-2">
                    <Textarea 
                      placeholder="Type requirement..." 
                      className="text-xs min-h-[50px] resize-none"
                      value={c.clause}
                      onChange={(e) => updateClause(c.id, { clause: e.target.value })}
                    />
                  </TableCell>
                  <TableCell className="p-2">
                    <Select value={c.confirm} onValueChange={(v: any) => updateClause(c.id, { confirm: v })}>
                      <SelectTrigger className={cn("h-8 text-xs font-bold", CONFIRM_OPTS.find(o => o.value === c.confirm)?.color)}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CONFIRM_OPTS.map(opt => (
                          <SelectItem key={opt.value} value={opt.value} className="text-xs">
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="p-2">
                    <Textarea 
                      placeholder="Remarks..." 
                      className="text-xs min-h-[50px] resize-none"
                      value={c.remarks}
                      onChange={(e) => updateClause(c.id, { remarks: e.target.value })}
                    />
                  </TableCell>
                  <TableCell className="p-2">
                    <Button variant="ghost" size="icon" onClick={() => removeClause(c.id)} className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
