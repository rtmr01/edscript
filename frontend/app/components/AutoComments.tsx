import { Lightbulb, TrendingUp, AlertCircle } from 'lucide-react';

interface Comment {
  text: string;
  type: 'insight' | 'trend' | 'alert';
}

interface AutoCommentsProps {
  comments: Comment[];
}

export function AutoComments({ comments }: AutoCommentsProps) {
  const getCommentIcon = (type: Comment['type']) => {
    switch (type) {
      case 'insight':
        return Lightbulb;
      case 'trend':
        return TrendingUp;
      case 'alert':
        return AlertCircle;
    }
  };

  const getCommentStyles = (type: Comment['type']) => {
    switch (type) {
      case 'insight':
        return {
          bg: 'bg-gradient-to-r from-blue-50 to-indigo-50',
          border: 'border-blue-200',
          icon: 'text-blue-600',
          iconBg: 'bg-blue-100'
        };
      case 'trend':
        return {
          bg: 'bg-gradient-to-r from-emerald-50 to-green-50',
          border: 'border-emerald-200',
          icon: 'text-emerald-600',
          iconBg: 'bg-emerald-100'
        };
      case 'alert':
        return {
          bg: 'bg-gradient-to-r from-amber-50 to-orange-50',
          border: 'border-amber-200',
          icon: 'text-amber-600',
          iconBg: 'bg-amber-100'
        };
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <Lightbulb className="w-4 h-4 text-indigo-600" />
        <h3 className="text-slate-900">Insights Baseados em Dados</h3>
      </div>

      <div className="space-y-2">
        {comments.map((comment, idx) => {
          const Icon = getCommentIcon(comment.type);
          const styles = getCommentStyles(comment.type);

          return (
            <div
              key={idx}
              className={`${styles.bg} ${styles.border} border rounded-lg p-4 transition-all duration-200 hover:shadow-md`}
            >
              <div className="flex items-start gap-3">
                <div className={`${styles.iconBg} p-2 rounded-lg flex-shrink-0`}>
                  <Icon className={`w-4 h-4 ${styles.icon}`} />
                </div>
                <p className="text-sm text-slate-700 leading-relaxed flex-1">
                  {comment.text}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
