'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Bold,
    Italic,
    Underline,
    List,
    ListOrdered,
    Link,
    Image,
    Quote,
    Heading1,
    Heading2,
    Heading3,
    Eye,
    Edit
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    minHeight?: string;
}

export function RichTextEditor({
    value,
    onChange,
    placeholder = "Start writing...",
    className,
    minHeight = "300px"
}: RichTextEditorProps) {
    const [isPreview, setIsPreview] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const insertText = useCallback((before: string, after: string = '') => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = value.substring(start, end);

        const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
        onChange(newText);

        // Restore cursor position
        setTimeout(() => {
            textarea.focus();
            const newCursorPos = start + before.length + selectedText.length + after.length;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
    }, [value, onChange]);

    const formatText = useCallback((format: string) => {
        switch (format) {
            case 'bold':
                insertText('**', '**');
                break;
            case 'italic':
                insertText('*', '*');
                break;
            case 'underline':
                insertText('<u>', '</u>');
                break;
            case 'h1':
                insertText('# ');
                break;
            case 'h2':
                insertText('## ');
                break;
            case 'h3':
                insertText('### ');
                break;
            case 'ul':
                insertText('- ');
                break;
            case 'ol':
                insertText('1. ');
                break;
            case 'quote':
                insertText('> ');
                break;
            case 'link':
                insertText('[', '](url)');
                break;
            case 'image':
                insertText('![alt text](', ')');
                break;
        }
    }, [insertText]);

    const renderPreview = useCallback((text: string) => {
        // Simple markdown-like rendering
        let html = text
            // Headers
            .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mb-2">$1</h3>')
            .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mb-3">$1</h2>')
            .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mb-4">$1</h1>')
            // Bold and italic
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            // Underline
            .replace(/<u>(.*?)<\/u>/g, '<u>$1</u>')
            // Links
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')
            // Images
            .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg my-2" />')
            // Lists
            .replace(/^- (.*$)/gm, '<li class="ml-4">• $1</li>')
            .replace(/^\d+\. (.*$)/gm, '<li class="ml-4">$1</li>')
            // Quotes
            .replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-2">$1</blockquote>')
            // Line breaks
            .replace(/\n/g, '<br />');

        return html;
    }, []);

    const toolbarButtons = [
        { icon: Bold, action: 'bold', title: 'Bold (Ctrl+B)' },
        { icon: Italic, action: 'italic', title: 'Italic (Ctrl+I)' },
        { icon: Underline, action: 'underline', title: 'Underline (Ctrl+U)' },
        { icon: Heading1, action: 'h1', title: 'Heading 1' },
        { icon: Heading2, action: 'h2', title: 'Heading 2' },
        { icon: Heading3, action: 'h3', title: 'Heading 3' },
        { icon: List, action: 'ul', title: 'Bullet List' },
        { icon: ListOrdered, action: 'ol', title: 'Numbered List' },
        { icon: Quote, action: 'quote', title: 'Quote' },
        { icon: Link, action: 'link', title: 'Link' },
        { icon: Image, action: 'image', title: 'Image' },
    ];

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'b':
                    e.preventDefault();
                    formatText('bold');
                    break;
                case 'i':
                    e.preventDefault();
                    formatText('italic');
                    break;
                case 'u':
                    e.preventDefault();
                    formatText('underline');
                    break;
            }
        }
    }, [formatText]);

    return (
        <Card className={cn("w-full", className)}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Rich Text Editor</CardTitle>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant={isPreview ? "outline" : "default"}
                            size="sm"
                            onClick={() => setIsPreview(false)}
                        >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                        </Button>
                        <Button
                            variant={isPreview ? "default" : "outline"}
                            size="sm"
                            onClick={() => setIsPreview(true)}
                        >
                            <Eye className="h-4 w-4 mr-1" />
                            Preview
                        </Button>
                    </div>
                </div>

                {!isPreview && (
                    <div className="flex flex-wrap gap-1 pt-2 border-t">
                        {toolbarButtons.map(({ icon: Icon, action, title }) => (
                            <Button
                                key={action}
                                variant="ghost"
                                size="sm"
                                onClick={() => formatText(action)}
                                title={title}
                                className="h-8 w-8 p-0"
                            >
                                <Icon className="h-4 w-4" />
                            </Button>
                        ))}
                    </div>
                )}
            </CardHeader>

            <CardContent className="pt-0">
                {isPreview ? (
                    <div
                        className="prose prose-sm max-w-none p-4 border rounded-md bg-gray-50 min-h-[300px]"
                        style={{ minHeight }}
                        dangerouslySetInnerHTML={{ __html: renderPreview(value) }}
                    />
                ) : (
                    <textarea
                        ref={textareaRef}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        className="w-full p-4 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        style={{ minHeight }}
                    />
                )}

                {!isPreview && (
                    <div className="mt-2 text-xs text-gray-500">
                        <p>Formatting tips:</p>
                        <ul className="mt-1 space-y-1">
                            <li>**bold** or *italic* text</li>
                            <li># Heading 1, ## Heading 2, ### Heading 3</li>
                            <li>- Bullet list or 1. Numbered list</li>
                            <li>[Link text](URL) or ![Alt text](Image URL)</li>
                            <li>&gt; Quote text</li>
                        </ul>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
