<div class="flex space-x-1 mx-2">
    <span>
        <span class="text-red font-bold">
            <?php echo e($issue->symbol()); ?>

        </span>
        <span class="ml-1">
            <?php echo e($issue->file()); ?>

        </span>
    </span>
    <span class="flex-1 text-gray text-right <?php echo e($isVerbose ? '' : 'truncate'); ?>">
        <?php echo e($issue->description($testing)); ?>

    </span>
</div>
<?php /**PATH phar:///var/www/vendor/laravel/pint/builds/pint/resources/views/issue/show.blade.php ENDPATH**/ ?>