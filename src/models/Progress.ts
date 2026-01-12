import mongoose, { Document, Schema } from 'mongoose';

// Video Progress interface
export interface IVideoProgress extends Document {
  _id: mongoose.Types.ObjectId;
  videoId: mongoose.Types.ObjectId;
  watchedDuration: number; // in seconds
  totalDuration: number; // in seconds
  completionPercentage: number; // 0-100
  isCompleted: boolean;
  lastWatchedAt: Date;
  watchCount: number;
}

// Section Progress interface
export interface ISectionProgress extends Document {
  _id: mongoose.Types.ObjectId;
  sectionId: mongoose.Types.ObjectId;
  videosProgress: IVideoProgress[];
  materialsAccessed: mongoose.Types.ObjectId[];
  quizzesCompleted: mongoose.Types.ObjectId[];
  completionPercentage: number; // 0-100
  isCompleted: boolean;
  lastAccessedAt: Date;
}

// Course Progress interface
export interface ICourseProgress extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  sectionsProgress: ISectionProgress[];
  overallCompletionPercentage: number; // 0-100
  isCompleted: boolean;
  enrolledAt: Date;
  lastAccessedAt: Date;
  totalTimeSpent: number; // in seconds
  certificateEarned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Video Progress Schema
const VideoProgressSchema = new Schema<IVideoProgress>({
  videoId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Video'
  },
  watchedDuration: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  totalDuration: {
    type: Number,
    required: true,
    min: 0
  },
  completionPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 0
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  lastWatchedAt: {
    type: Date,
    default: Date.now
  },
  watchCount: {
    type: Number,
    default: 1,
    min: 1
  }
}, {
  _id: true,
  timestamps: false
});

// Section Progress Schema
const SectionProgressSchema = new Schema<ISectionProgress>({
  sectionId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Section'
  },
  videosProgress: [VideoProgressSchema],
  materialsAccessed: [{
    type: Schema.Types.ObjectId,
    ref: 'Material'
  }],
  quizzesCompleted: [{
    type: Schema.Types.ObjectId,
    ref: 'Quiz'
  }],
  completionPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 0
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now
  }
}, {
  _id: true,
  timestamps: false
});

// Course Progress Schema
const CourseProgressSchema = new Schema<ICourseProgress>({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  courseId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Course'
  },
  sectionsProgress: [SectionProgressSchema],
  overallCompletionPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 0
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  enrolledAt: {
    type: Date,
    default: Date.now
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now
  },
  totalTimeSpent: {
    type: Number,
    default: 0,
    min: 0
  },
  certificateEarned: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better query performance
CourseProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });
CourseProgressSchema.index({ userId: 1 });
CourseProgressSchema.index({ courseId: 1 });
CourseProgressSchema.index({ isCompleted: 1 });
CourseProgressSchema.index({ lastAccessedAt: -1 });

// Methods for calculating progress
CourseProgressSchema.methods.calculateOverallProgress = function() {
  if (this.sectionsProgress.length === 0) {
    this.overallCompletionPercentage = 0;
    return 0;
  }

  const totalPercentage = this.sectionsProgress.reduce((sum: number, section: ISectionProgress) => {
    return sum + section.completionPercentage;
  }, 0);

  this.overallCompletionPercentage = Math.round(totalPercentage / this.sectionsProgress.length);
  this.isCompleted = this.overallCompletionPercentage >= 100;
  
  return this.overallCompletionPercentage;
};

SectionProgressSchema.methods.calculateSectionProgress = function() {
  const totalItems = this.videosProgress.length + this.materialsAccessed.length + this.quizzesCompleted.length;
  
  if (totalItems === 0) {
    this.completionPercentage = 0;
    return 0;
  }

  const completedVideos = this.videosProgress.filter((video: IVideoProgress) => video.isCompleted).length;
  const completedItems = completedVideos + this.materialsAccessed.length + this.quizzesCompleted.length;
  
  this.completionPercentage = Math.round((completedItems / totalItems) * 100);
  this.isCompleted = this.completionPercentage >= 100;
  
  return this.completionPercentage;
};

VideoProgressSchema.methods.updateProgress = function(watchedDuration: number) {
  this.watchedDuration = Math.max(this.watchedDuration, watchedDuration);
  this.completionPercentage = Math.min(Math.round((this.watchedDuration / this.totalDuration) * 100), 100);
  this.isCompleted = this.completionPercentage >= 80; // Consider 80% as completed
  this.lastWatchedAt = new Date();
  
  return this.completionPercentage;
};

export default mongoose.models.CourseProgress || mongoose.model<ICourseProgress>('CourseProgress', CourseProgressSchema);
