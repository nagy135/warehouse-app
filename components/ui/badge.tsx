import * as React from 'react';
import { View } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ViewRef } from '@rn-primitives/types';
import { cn } from '~/lib/utils';
import { Text } from './text';

const badgeVariants = cva(
    'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
    {
        variants: {
            variant: {
                default: 'border-transparent bg-primary text-primary-foreground',
                secondary: 'border-transparent bg-secondary text-secondary-foreground',
                blue: 'border-transparent bg-sky-200 text-secondary-foreground',
                destructive: 'border-transparent bg-destructive text-destructive-foreground',
                success: 'border-transparent bg-green-400 text-gray-800',
                outline: 'text-foreground',
                pink: 'border-transparent bg-pink-200 text-secondary-foreground',
                darkPink: 'border-transparent bg-pink-800 text-gray-200',
                yellow: 'border-transparent bg-yellow-200 text-secondary-foreground',
            },
        },
        defaultVariants: { variant: 'default' },
    }
);

export interface BadgeProps
    extends React.ComponentPropsWithoutRef<typeof View>,
    VariantProps<typeof badgeVariants> { }

export const Badge = React.forwardRef<ViewRef, BadgeProps>(
    ({ className, variant, children, ...props }, ref) => (
        <View ref={ref} className={cn('self-start', badgeVariants({ variant }), className)} {...props}>
            <Text className="text-xs font-semibold">{children}</Text>
        </View>
    )
);
Badge.displayName = 'Badge';

export { badgeVariants };
