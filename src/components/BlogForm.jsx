import Quill from 'quill';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import SEOForm from './SEOForm';
import { getBackendUrl } from '../config/api';

// Older blogs store a relative /uploads path; new ones store a full URL
const resolveImageUrl = (image) =>
  image ? (image.startsWith('/') ? `${getBackendUrl()}${image}` : image) : null;

// Register custom size style with Quill BEFORE any React imports
const SizeStyle = Quill.import('attributors/style/size');
const fontSizes = ['small', 'normal', 'large', 'huge'];
SizeStyle.whitelist = fontSizes;
Quill.register(SizeStyle, true);

const BlogForm = ({ initialData, onSubmit, isLoading }) => {
  const [activeTab, setActiveTab] = useState('content');
  const [content, setContent] = useState(initialData?.content || '');
  const [imagePreview, setImagePreview] = useState(
    resolveImageUrl(initialData?.image)
  );
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: {
      title: initialData?.title || '',
      slug: initialData?.slug || '',
      country: initialData?.country || '',
      continent: initialData?.continent || '',
      readTime: initialData?.readTime || '',
    },
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(resolveImageUrl(initialData?.image));
    }
  };

  const handleFormSubmit = (formData) => {
    const blogData = {
      ...formData,
      content,
      readTime: formData.readTime,
      image: formData.image && formData.image[0] ? formData.image[0] : null,
    };
    
    onSubmit(blogData);
  };

  const handleSEOSubmit = (seoData) => {
    const imageElement = document.getElementById('image');
    const imageFile = imageElement && imageElement.files && imageElement.files[0] ? imageElement.files[0] : null;
    
    const formData = {
      title: watch('title'),
      slug: watch('slug'),
      country: watch('country'),
      continent: watch('continent'),
      readTime: watch('readTime'),
      content,
      image: imageFile,
      seo: seoData,
    };
    
    onSubmit(formData);
  };

  // Enhanced toolbar configuration with practical font sizes
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'font': [] }],
      [{ 'size': fontSizes }], // Only classic Quill sizes
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'align': [] }],
      ['blockquote', 'code-block'],
      ['link', 'image', 'video'],
      ['clean']
    ],
    clipboard: {
      matchVisual: false,
    }
  };

  // Custom formats for better styling
  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'script',
    'list', 'bullet', 'indent',
    'direction', 'align',
    'blockquote', 'code-block',
    'link', 'image', 'video'
  ];

  return (
    <div>
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex">
          <button
            className={`py-4 px-6 border-b-2 font-medium text-sm ${
              activeTab === 'content'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('content')}
          >
            Content
          </button>
          <button
            className={`py-4 px-6 border-b-2 font-medium text-sm ${
              activeTab === 'seo'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('seo')}
          >
            SEO Settings
          </button>
        </nav>
      </div>

      {activeTab === 'content' ? (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div>
            <label htmlFor="title" className="form-label">
              Blog Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              className="form-input"
              placeholder="Enter blog title"
              {...register('title', { required: 'Blog title is required' })}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="slug" className="form-label">
              Slug <span className="text-red-500">*</span>
            </label>
            <input
              id="slug"
              type="text"
              className="form-input"
              placeholder="Enter blog slug (e.g. my-blog-post)"
              {...register('slug', { 
                required: 'Blog slug is required',
                pattern: {
                  value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                  message: 'Slug must contain only lowercase letters, numbers, and hyphens'
                }
              })}
            />
            {errors.slug && (
              <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              The slug will be used in the URL: /blogs/your-slug
            </p>
          </div>

          <div>
            <label htmlFor="country" className="form-label">
              Country/Region
            </label>
            <input
              id="country"
              type="text"
              className="form-input"
              placeholder="Enter country or region (e.g. BANGLADESH, GERMANY)"
              {...register('country')}
            />
            <p className="mt-1 text-xs text-gray-500">
              This will be displayed as the main header on the blog page
            </p>
          </div>

          <div>
            <label htmlFor="readTime" className="form-label">
              Read Time
            </label>
            <input
              id="readTime"
              type="text"
              className="form-input"
              placeholder="e.g. 5 min read"
              {...register('readTime')}
            />
            <p className="mt-1 text-xs text-gray-500">
              This will be shown on the blog card (e.g. 5 min read)
            </p>
          </div>

          <div>
            <label htmlFor="content" className="form-label">
              Content <span className="text-red-500">*</span>
            </label>
            <div className="border border-gray-300 rounded-md">
              <ReactQuill
                value={content}
                onChange={setContent}
                modules={modules}
                formats={formats}
                className="h-80"
                placeholder="Start writing your blog content here..."
                style={{
                  height: '320px'
                }}
              />
            </div>
            {!content && (
              <p className="mt-1 text-sm text-red-600">Content is required</p>
            )}
          </div>

          {/* Move Featured Image section outside the content editor's container and add margin-top */}
          <div style={{ marginTop: '5rem', display: 'block', width: '100%' }}>
            <label htmlFor="image" className="form-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
              Featured Image
            </label>
            <input
              id="image"
              type="file"
              className="form-input"
              accept="image/*"
              {...register('image')}
              onChange={handleImageChange}
            />
            {imagePreview && (
              <div className="mt-2">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-40 w-auto object-cover rounded-md"
                />
              </div>
            )}
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading || !content}
            >
              {isLoading ? 'Saving...' : 'Save & Continue'}
            </button>
          </div>
        </form>
      ) : activeTab === 'seo' ? (
        <SEOForm
          initialData={initialData?.seo}
          onSubmit={handleSEOSubmit}
          isLoading={isLoading}
        />
      ) : null}
    </div>
  );
};

export default BlogForm; 