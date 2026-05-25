<div class="mt-2 mx-2">
    <div class="flex space-x-1">
        <span class="flex-1 content-repeat-[─] text-gray">

        </span>

        <span class="text-gray">
            <?php echo e($preset); ?>

        </span>
    </div>

    <div>
        <span>
            <div class="flex space-x-1">

                <?php
                    $fixableErrors = $issues->filter->fixable();
                    $nonFixableErrors = $issues->reject->fixable();
                ?>

                <?php if($issues->count() == 0): ?>
                <span class="px-2 bg-green text-gray uppercase font-bold">
                    PASS
                </span>
                <?php elseif($nonFixableErrors->count() == 0 && ! $testing): ?>
                <span class="px-2 bg-green text-gray uppercase font-bold">
                    FIXED
                </span>
                <?php else: ?>
                <span class="px-2 bg-red text-white uppercase font-bold">
                    FAIL
                </span>
                <?php endif; ?>

                <span class="flex-1 content-repeat-[.] text-gray"></span>
                <span>
                    <span>
                        <?php echo e($totalFiles); ?> <?php echo e(str('file')->plural($totalFiles)); ?>

                    </span>

                    <?php if($nonFixableErrors->isNotEmpty()): ?>
                    <span>
                        , <?php echo e($nonFixableErrors->count()); ?> <?php echo e(str('error')->plural($nonFixableErrors)); ?>

                    </span>
                    <?php endif; ?>

                    <?php if($fixableErrors->isNotEmpty()): ?>
                    <span>
                        <?php if($testing): ?>
                        , <?php echo e($fixableErrors->count()); ?> style <?php echo e(str('issue')->plural($fixableErrors)); ?>

                        <?php else: ?>
                        , <?php echo e($fixableErrors->count()); ?> style <?php echo e(str('issue')->plural($fixableErrors)); ?> fixed
                        <?php endif; ?>
                    </span>
                    <?php endif; ?>
                </span>
            </div>
        </span>
    </div>
</div>
<?php /**PATH phar:///var/www/vendor/laravel/pint/builds/pint/resources/views/summary.blade.php ENDPATH**/ ?>